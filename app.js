const express = require('express');
const app = express();
const port = 3000;
const ejsMate = require('ejs-mate');
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const Campground = require('./models/campground');
const ExpressError = require('./utils/ExpressError');
const catchAsync = require('./utils/catchAsync');
const { campgroundSchema } = require('./schemas')

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Database connected!');
});

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


app.use(methodOverride('_method'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next()
    }
}

// RESTful Routes
app.get('/', (req, res) => {
    res.send('Homepage to Campgrounds');
})

//Campground Index
app.get('/campgrounds', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
}));

//New Campground
app.get('/campgrounds/new', catchAsync(async (req, res) => {
    res.render('campgrounds/new');
}));


app.post('/campgrounds', validateCampground, catchAsync(async (req, res) => {
    const newCamp = new Campground(req.body.campground);
    await newCamp.save();
    console.log(newCamp.id);
    res.redirect(`/campgrounds/${newCamp.id}`);
}));

//Edit Campground
app.get('/campgrounds/:id/edit', catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    res.render('campgrounds/edit', { campground });
}))

app.put('/campgrounds/:id', validateCampground, catchAsync(async (req, res) => {
    const data = req.body;
    const { id } = req.params;
    const updateCamp = await Campground.findByIdAndUpdate(id, { ...data.campground }, { runValidators: true, new: true });
    await updateCamp.save();
    res.redirect(`/campgrounds/${updateCamp.id}`);
}))

//View Campground
app.get('/campgrounds/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    res.render('campgrounds/show', { campground });
}))

//Delete Campground

app.delete('/campgrounds/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
}))

//Response to unnavailable routes

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

// Error Handler
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Opps, something went wrong!'
    res.status(statusCode).render('error', { err });
})

app.listen(port, () => {
    console.log(`Serving on port ${port}`);
})
