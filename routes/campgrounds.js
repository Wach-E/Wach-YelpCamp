const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const Campground = require('../models/campground');

const { isLoggedIn, isAuthor, validateCampground } = require('../middleware');

//Campground Index
router.get('/', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
}));

//New Campground
router.get('/new', isLoggedIn, catchAsync(async (req, res) => {
    res.render('campgrounds/new');
}));


router.post('/', isLoggedIn, validateCampground, catchAsync(async (req, res) => {
    const newCamp = new Campground(req.body.campground);
    newCamp.author = req.user._id;
    await newCamp.save();
    req.flash('success', 'Sucessfully made a new campground');
    res.redirect(`/campgrounds/${newCamp.id}`);
}));

//Edit Campground
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground) {
        req.flash('error', 'Campground not found');
        return res.redirect('/campground');
    }
    res.render('campgrounds/edit', { campground });
}));

router.put('/:id', isLoggedIn, isAuthor, validateCampground, catchAsync(async (req, res) => {
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
    const campground = await Campground.findById(id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    if (!campground) {
        req.flash('error', 'Campground not found');
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/show', { campground });
}));

//Delete Campground
router.delete('/:id', isLoggedIn, isAuthor, catchAsync(async (req, res) => {
    const { id } = req.params;
    const { title } = await Campground.findById(id);
    await Campground.findByIdAndDelete(id);
    req.flash('success', `Successfully deleted ${title} campground`);
    res.redirect('/campgrounds');
}));

module.exports = router;