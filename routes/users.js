const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const passport = require('passport');
const users = require('../controllers/users')

router.get('/register', users.registerForm)

router.post('/register', catchAsync(users.registerUser))

router.get('/login', users.loginForm)

router.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}), users.loginUser);

router.get('/logout', users.logoutUser)

module.exports = router;