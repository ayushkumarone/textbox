require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const _ = require('lodash');
const mongoose = require('mongoose');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
mongoose.connect(process.env.MONGODB_CONNECT, { useNewUrlParser: true });

const pastesSchema = {
    owner: String,
    topic: String,
    date: String,
    code: String,
};

const userSchema = {
    email: String,
    password: String,
};

const Paste = mongoose.model('Paste', pastesSchema);
const User = mongoose.model('User', userSchema);

// ------------------------------------- POST BEGIN -------------------------------------

app.post('/', function (req, res) {
    const owner = _.capitalize(req.body.ownerName);
    const topic = _.capitalize(req.body.topicName);
    const code = req.body.codePaste;
    const date = new Date();
    const tostore = date.toLocaleString();
    const paste = new Paste({
        owner: owner,
        topic: topic,
        date: tostore,
        code: code,
    });

    paste.save();
    res.redirect('/');
});

app.post('/delete', function (req, res) {
    const checkedItemId = req.body.checkbox;
    Paste.findByIdAndRemove(checkedItemId, function (err) {
        if (!err) {
            console.log('Successfully deleted checked item.');
            Paste.find({}, function (err, foundItems) {
                res.render('user', { listTitle: 'Codes', Codeslist: foundItems });
            });
        }
    });
});

// app.post('/register', function (req, res) {
//     const newUser = new User({
//         email: req.body.userid,
//         password: req.body.password,
//     });
//     newUser.save(function (err) {
//         if (err) {
//             console.log(err);
//         } else {
//             res.render('user');
//         }
//     });
// });

app.post('/login', function (req, res) {
    const username = req.body.userid;
    const password = req.body.password;

    User.findOne({ email: username, password: password }, function (err, founduser) {
        if (err) {
            console.log(err);
        } else {
            if (founduser) {
                Paste.find({}, function (err, foundItems) {
                    res.render('user', { listTitle: 'Codes', Codeslist: foundItems });
                });
            } else {
                console.log('Invalid');
                res.render('login');
            }
        }
    });
});

// ------------------------------------- POST END -------------------------------------

// ------------------------------------- GET BEGIN -------------------------------------
app.get('/', function (req, res) {
    Paste.find({}, function (err, foundItems) {
        res.render('main', { listTitle: 'Codes', Codeslist: foundItems });
    });
});

app.get('/login', function (req, res) {
    res.render('login', {});
});

// app.get("/register", function(req, res){
//     res.render("register",{});
// });

app.get('/:codeId', function (req, res) {
    const codeid = req.params.codeId;
    Paste.findOne({ _id: codeid }, function (err, foundCode) {
        if (!err) {
            Paste.find({}, function (err, foundItems) {
                // res.redirect("/" + codedisplay);
                res.render('codedisplay', {
                    owner: foundCode.owner,
                    code: foundCode.code,
                    topic: foundCode.topic,
                    Codeslist: foundItems,
                });
            });
        }
    });
});

app.get('/login/:codeId', function (req, res) {
    const codeid = req.params.codeId;
    Paste.findOne({ _id: codeid }, function (err, foundCode) {
        if (!err) {
            Paste.find({}, function (err, foundItems) {
                // res.redirect("/" + codedisplay);
                res.render('admincodedisplay', {
                    owner: foundCode.owner,
                    code: foundCode.code,
                    topic: foundCode.topic,
                    Codeslist: foundItems,
                });
            });
        }
    });
});
// ------------------------------------- GET END -------------------------------------

const PORT = process.env.PORT || 5000;
app.listen(PORT, function () {
    console.log(`Server started on port ${PORT}`);
});
