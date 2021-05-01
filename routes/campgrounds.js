const express = require('express');
const router = express.Router();
const campgrounds = require('../controllers/campgrounds')
const catchAsync = require('../utils/catchAsync');
const Campground = require('../models/campground');

const { isLoggedIn, isAuthor, validateCampground } = require('../middleware');

//Campground Index
router.get('/', catchAsync(campgrounds.index));

//New Campground
router.get('/new', isLoggedIn, campgrounds.renderNewForm);


router.post('/', isLoggedIn, validateCampground, catchAsync(campgrounds.createCampground));

//Edit Campground
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.editCampground));

router.put('/:id', isLoggedIn, isAuthor, validateCampground, catchAsync(campgrounds.updateCampground));

//View Campground
router.get('/:id', catchAsync(campgrounds.showCampground));

//Delete Campground
router.delete('/:id', isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));

module.exports = router;