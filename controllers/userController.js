var express = require('express');
var router = express.Router();
var User = require('../models/user');
var Message = require('../models/message');
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
                    return done(null, false, { message: "Incorrect password" })
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

exports.index = function (req, res, next) {
    if (res.locals.currentUser) {
        console.log("Current user is: " + res.locals.currentUser);
    }
    else {
        console.log("No current user logged in");
    }
    
    
    Message.find()
        .populate('user')
        .exec(function (err, list_message) {
            if (err) { return next(err); }
            list_message.forEach((message) => {
                message.message = decodeURIComponent(message.message);
            })

            res.render('index', {title: 'Club Memba', user: res.locals.currentUser, error: err, message_list: list_message });
    });
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
                    next();
                });    
            });  
        }
    }
];


//refresh comment
exports.members_get = function (req, res, next) {
    res.render('members', { title: 'Become a member', user: res.locals.currentUser });
};

exports.members_post = [

    body('memberPassword', 'Password must not be empty.').isLength({ min: 1 }).trim(),
    sanitizeBody('memberPassword').escape(),
    // Process request after validation and sanitization.
    (req, res, next) => {
        
        // Extract the validation errors from a request.
        const errors = validationResult(req);
        if (typeof req.body.admin === "undefined") {
            admin= false;
        } 

        else {
            admin = true;
        } 

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/error messages.
            res.render('members', { title: 'Members Form failure'});
            return;
        }

        if (req.body.memberPassword != 'secret') {
            res.render('members', { title: 'Incorrect member password' });
            return;
        }
        
        else {
            // Data from form is valid. Update the record.
            User.findByIdAndUpdate(res.locals.currentUser._id, { $set: { "member": true, "admin": admin } }, function (err, callback) {
                if (err) { 
                    return next(err); }
                // Successful - redirect 
                res.redirect('/');
            });
        }
    }
];



exports.login_get = function (req, res, next) {
    res.render('log-in', { title: 'Log In' });
};

exports.login_post = [
    validator.body('username', 'username required').isLength({ min: 1 }).trim(),
    validator.body('password', 'password required').isLength({ min: 1 }).trim(),
    validator.sanitizeBody('username').escape(),
    validator.sanitizeBody('password').escape(),


    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validator.validationResult(req);
        if (!errors.isEmpty()) {
            //console.log(errors.array()[0]['msg']);
            // There are errors. Render the form again with sanitized values/error messages.
            res.render('log-in', { title: errors.array()[0]['msg'], errors: errors.array()[0]['msg'] });
            return;
        }
        else {
            console.log("Log in post worked");
            next();
        }
    }
];

exports.message_get = function (req, res, next) {
    res.render('message', { title: 'Welcome ' });
};

exports.message_post = [
    validator.body('messageBody', 'Message required').isLength({ min: 1 }).trim(),
    validator.sanitizeBody('messageBody').escape(),
  

    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validator.validationResult(req);
        if (!errors.isEmpty()) {
            //console.log(errors.array()[0]['msg']);
            // There are errors. Render the form again with sanitized values/error messages.
            res.render('message', { title: errors.array()[0]['msg'], errors: errors.array()[0]['msg'] });
            return;
        }
        else {
        
            const message = new Message({
                user: res.locals.currentUser,
                message: req.body.messageBody,
            }).save(err => {
                if (err) return next(err);
                res.redirect('/');
            });
        }
    }
];

exports.message_delete_post = function (req, res, next) {
    Message.findByIdAndRemove(req.body.messageId, function deleteMessage(err) {
        if (err) { return next(err); }
        // Success - go to author list
        res.redirect('/')
    })    
};






