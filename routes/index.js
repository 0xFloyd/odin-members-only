var express = require('express');
var router = express.Router();
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
var user_controller = require('../controllers/userController');

router.use(function (req, res, next) {
    res.locals.currentUser = req.user;
    next();
});

/* GET home page. */
router.get('/', user_controller.index );

router.get('/success', user_controller.success);

router.get("/sign-up", user_controller.sign_up_get);

router.post("/sign-up", user_controller.sign_up_post);

// passport autheticate does the functions coded above 
router.post(
    "/log-in",
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
