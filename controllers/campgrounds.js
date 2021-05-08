const Campground = require('../models/campground');
const { cloudinary } = require('../cloudinary');

module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
}

module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new');
}

module.exports.createCampground = async (req, res) => {
    const newCamp = new Campground(req.body.campground);
    newCamp.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    newCamp.author = req.user._id;
    await newCamp.save();
    console.log(newCamp);
    req.flash('success', 'Sucessfully made a new campground');
    res.redirect(`/campgrounds/${newCamp.id}`);
}

module.exports.editCampground = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground) {
        req.flash('error', 'Campground not found');
        return res.redirect('/campground');
    }
    res.render('campgrounds/edit', { campground });
}

module.exports.updateCampground = async (req, res) => {
    const data = req.body;
    const { id } = req.params;
    const updateCamp = await Campground.findByIdAndUpdate(id, { ...data.campground }, { runValidators: true, new: true });
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    updateCamp.images.push(...imgs);
    await updateCamp.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await updateCamp.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } });
    }
    req.flash('success', 'Successfully updated campground');
    res.redirect(`/campgrounds/${updateCamp.id}`);
}

module.exports.showCampground = async (req, res) => {
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
}

module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    const { title } = await Campground.findById(id);
    await Campground.findByIdAndDelete(id);
    req.flash('success', `Successfully deleted ${title} campground`);
    res.redirect('/campgrounds');
}