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
    if (res.locals.currentUser) {
        //console.log(res.locals.currentUser._id);
    }
    next();
});

// this is what passport.autheticate() uses to authenticate by communicating with database 
passport.use(new LocalStrategy(
    function (username, password, done) {
        User.findOne({ username: username }, function (err, user) {
            if (err) { return done(err); }
            if (!user) {
                return done(null, false, { msg: 'Incorrect username.' });
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

router.post('/', user_controller.message_delete_post)

router.get("/sign-up", user_controller.sign_up_get);

router.post("/sign-up", user_controller.sign_up_post, passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/sign-up"
}));

router.get("/log-in", user_controller.login_get);

router.post("/log-in", user_controller.login_post,
    passport.authenticate("local", {
        successRedirect: "/",
        failureRedirect: "/log-in"
    })
);
    
router.get("/members", user_controller.members_get);

router.post("/members", user_controller.members_post);

router.get("/message", user_controller.message_get);

router.post("/message", user_controller.message_post);

// logiut route. req.logout is part of the passport middleware 
router.get("/log-out", (req, res) => {
    req.logout();
    res.redirect("/");
});

module.exports = router;
