const express = require('express');
const app = express();
const port = 3000;
const ejsMate = require('ejs-mate');
const path = require('path');
const flash = require('connect-flash');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const ExpressError = require('./utils/ExpressError');
const session = require('express-session');

const campgrounds = require('./routes/campgrounds');
const reviews = require('./routes/reviews');
const { nextTick } = require('process');

const sessionConfig = {
    secret: 'wachSecret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
};

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
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
app.use(express.static(path.join(__dirname, 'public')));


app.use(session(sessionConfig));
app.use(flash())
app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

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
