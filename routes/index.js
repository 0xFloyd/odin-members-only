var express = require('express');
var router = express.Router();
var User = require('../models/user');
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
var user_controller = require('../controllers/userController');

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

/* GET home page. */
router.get('/', user_controller.index);

router.get('/success', user_controller.success);

router.get("/sign-up", user_controller.sign_up_get);

router.post("/sign-up", user_controller.sign_up_post);

router.get("/log-in", user_controller.login_get);

router.post("/log-in", 
    passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/"
    })
);


// logiut route. req.logout is part of the passport middleware 
router.get("/log-out", (req, res) => {
    req.logout();
    res.redirect("/");
});

module.exports = router;
