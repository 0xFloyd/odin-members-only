var express = require('express');
var router = express.Router();
var User = require('../models/user');
var Post = require('../models/post');
const validator = require('express-validator');
const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
const bcrypt = require("bcryptjs");
const session = require("express-session");
var async = require('async');
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const signupFailures = ({ location, msg, param, value, nestedErrors }) => {
    return {
        type: "Error",
        name: "Signup Failure",
        location: location,
        message: msg,
        param: param,
        value: value,
        nestedErrors: nestedErrors
    }
};

router.use(function (req, res, next) {
    res.locals.currentUser = req.user;
    next();
});

// this is what passport.autheticate() uses to authenticate by communicating with database 
passport.use(new LocalStrategy(
    function (username, password, done) {
        User.findOne({ username: username }, function (err, user) {
            if (err) { return done(err); }
            if (!user) {
                return done(null, false, { message: 'Incorrect username.' });
            }
            bcrypt.compare(password, user.password, (err, res) => {
                if (res) {
                    // passwords match! log user in
                    return done(null, user)
                } else {
                    // passwords do not match!
                    return done(null, false, { msg: "Incorrect password" })
                }
            })
            return done(null, user);
        });
    }
));

// create cookie 
passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
        done(err, user);
    });
});

exports.index = function (req, res) {
    req.url = '/';
    let user;
    if (req.user) {
        user = req.user;
    }
    if (req.body.username) {
        user = req.body.username;
    }
   /* async.parallel({
        user_count: function (callback) {
            User.countDocuments({}, callback); // Pass an empty object as match condition to find all documents of this collection
        },
       
    }, function (err, results) { */
    res.render('index', { title: 'Home', user: user /* error: err, data: results */});
   // });
};

exports.sign_up_get = function (req, res, next) {
    res.render('sign-up', { title: 'Sign Up' });
};

exports.sign_up_post = [
    validator.body('username', 'username required').isLength({ min: 1 }).trim(),
    validator.body('password', 'password required').isLength({ min: 1 }).trim(),
    validator.sanitizeBody('username').escape(),
    validator.sanitizeBody('password').escape(),
    validator.body('password', 'password required').exists(),
    validator.body('passwordConfirmation', 'Password Confirmation field must have the same value as the password field')
        .exists()
        .custom((value, { req }) => value === req.body.password),
    

    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validator.validationResult(req);
        if (!errors.isEmpty()) {
            //console.log(errors.array()[0]['msg']);
            // There are errors. Render the form again with sanitized values/error messages.
            res.render('sign-up', { title: errors.array()[0]['msg'], errors: errors.array()[0]['msg'] });
            return;
        }
        else {
            // Create a genre object with escaped and trimmed data.
            bcrypt.hash(req.body.password, 10, (err, hashedPassword) => {
                if (err) return next(err);
                const user = new User({
                    username: req.body.username,
                    password: hashedPassword
                }).save(err => {
                    if (err) return next(err);
                    res.render("index", { title: 'Welcome ' + req.body.username + '!', user: req.body});
                });
            });
        }
    }
];

exports.login_get = function (req, res, next) {
    res.render('log-in', { title: 'Log In' });
};
















   
/*
// Display list of all Books.
exports.post_list = function (req, res, next) {
    Post.find({}, 'title description')
        .populate('user')
        .exec(function (err, list_posts) {
            if (err) { return next(err); }
            //Successful, so render
            res.render('index', { title: 'Post List', post_list: list_posts });
        });

};
*/