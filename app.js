const express = require('express');
const app = express();
const port = 3000;
const ejsMate = require('ejs-mate');
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const ExpressError = require('./utils/ExpressError');

const campgrounds = require('./routes/campgrounds');
const reviews = require('./routes/reviews');

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

// RESTful Routes
app.get('/', (req, res) => {
    res.send('Homepage to Campgrounds');
});

app.use('/campgrounds', campgrounds);
app.use('/campgrounds/:id/reviews', reviews);

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
