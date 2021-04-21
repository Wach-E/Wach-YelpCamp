const express = require('express');
const router = express.Router();
const ExpressError = require('../utils/ExpressError');
const catchAsync = require('../utils/catchAsync');
const Campground = require('../models/campground');
const { campgroundSchema } = require('../schemas');

// Server-side validations for Campgrounds
const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next()
    }
}

//Campground Index
router.get('/', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
}));

//New Campground
router.get('/new', catchAsync(async (req, res) => {
    // BUG OCCURS HERE
    if (!req.isAuthenticated()) {
        req.flash('error', 'You must be signed in!')
        res.redirect('/login')
    }
    res.render('campgrounds/new');
}));


router.post('/', validateCampground, catchAsync(async (req, res) => {
    const newCamp = new Campground(req.body.campground);
    await newCamp.save();
    console.log(newCamp.id);
    req.flash('success', 'Sucessfully made a new campground');
    res.redirect(`/campgrounds/${newCamp.id}`);
}));

//Edit Campground
router.get('/:id/edit', catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground) {
        req.flash('error', 'Campground not found');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campground });
}));

router.put('/:id', validateCampground, catchAsync(async (req, res) => {
    const data = req.body;
    const { id } = req.params;
    const updateCamp = await Campground.findByIdAndUpdate(id, { ...data.campground }, { runValidators: true, new: true });
    await updateCamp.save();
    req.flash('success', 'Successfully updated campground');
    res.redirect(`/campgrounds/${updateCamp.id}`);
}));

//View Campground
router.get('/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id).populate('reviews');
    if (!campground) {
        req.flash('error', 'Campground not found');
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/show', { campground });
}));

//Delete Campground

router.delete('/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    const { title } = await Campground.findById(id);
    await Campground.findByIdAndDelete(id);
    req.flash('success', `Successfully deleted ${title} campground`);
    res.redirect('/campgrounds');
}));

module.exports = router;