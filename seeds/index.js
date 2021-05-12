const mongoose = require('mongoose');
const Campground = require('../models/campground');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
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

const sample = array => array[Math.floor(Math.random() * array.length)];
const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 50; i++) {
        const rand1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            author: '607f9c6c5e7b850b104fadc1',
            title: `${sample(descriptors)} ${sample(places)}`,
            location: `${cities[rand1000].city}, ${cities[rand1000].state}`,
            images: [
                {
                    url:
                        'https://res.cloudinary.com/wach/image/upload/v1620270704/YelpCamp/vq1zknhph7e5tick0sdd.png',
                    filename: 'YelpCamp/vq1zknhph7e5tick0sdd'
                },
                {
                    url:
                        'https://res.cloudinary.com/wach/image/upload/v1620270704/YelpCamp/xaumvnci4skpjsummxgs.jpg',
                    filename: 'YelpCamp/xaumvnci4skpjsummxgs'
                }
            ],
            description: 'Lorem, ipsum dolor sit amet consectetur adipisicing elit. At dicta accusamus esse deserunt sit numquam iste quia officia eaque aspernatur similique, ipsa voluptatum, voluptatem praesentium dolor veniam ratione molestiae. Corporis.',
            price,
            geometry: {
                type: "Point",
                coordinates: [
                    cities[rand1000].longitude,
                    cities[rand1000].latitude,
                ]
            },
        })
        await camp.save();
    }
    console.log('Data Saved!')
}

seedDB()
    .then(() => {
        db.close()
        console.log('Database Closed!')
    });