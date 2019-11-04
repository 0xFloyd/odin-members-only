var User = require('../models/user');
var Post = require('../models/post');
const validator = require('express-validator');
const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
const bcrypt = require("bcryptjs");
var async = require('async');


exports.index = function (req, res) {
    async.parallel({
        user_count: function (callback) {
            User.countDocuments({}, callback); // Pass an empty object as match condition to find all documents of this collection
        },
       
    }, function (err, results) {
        res.render('index', { title: 'Users', error: err, data: results });
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

    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validator.validationResult(req);
        if (!errors.isEmpty()) {
            // There are errors. Render the form again with sanitized values/error messages.
            res.render('sign-up', { title: 'Sign Up', errors: errors.array() });
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
                    res.redirect("/", {user: req.user});
                });
            });
        }
    }
];

exports.success = function (req, res, next) {
    res.render('sucess', { title: 'success' });
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