const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const User = require('../models/user');
const passport = require('passport');

router.get('/register', (req, res) => {
    res.render('users/register')
})

router.post('/register', catchAsync(async (req, res, next) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password)
        req.login(registeredUser, err => {
            if (err) return next(err);
            req.flash('success', 'Welcome to YelpCamp!');
            res.redirect('/campgrounds')
        })

    } catch (e) {
        req.flash('error', e.message);
        res.redirect('/register')
    }
}))

router.get('/login', (req, res) => {
    res.render('users/login');
})

router.post('/login',
    passport.authenticate('local'),
    function (req, res) {
        const redirectUrl = req.session.returnTo || '/campgrounds'
        delete req.session.returnTo
        req.flash('success', 'Welcome back to YelpCamp!')
        res.redirect(redirectUrl);
    });

router.get('/logout', (req, res) => {
    req.logout()
    req.flash('success', 'Thank you for using YelpCamp, Goodbye!')
    res.redirect('/campgrounds')
})

module.exports = router;