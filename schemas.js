const Joi = require('joi');

module.exports.campgroundSchema = Joi.object({
    campground: Joi.object({
        title: Joi.string()
            .min(6)
            .max(30)
            .required(),
        location: Joi.string().required(),
        image: Joi.string().required(),
        price: Joi.number()
            .min(0)
            .required(),
        description: Joi.string()
            .min(15)
            .required()
    }).required()
})

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        body: Joi.string().required()
    }).required()
})