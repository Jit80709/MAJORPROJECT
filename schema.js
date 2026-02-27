/**********************************************************************
 * SCHEMA.JS (Joi Validation Layer)
 
 * This file defines input validation rules using Joi.
 *
 * Purpose:
 * • Validate user input before it reaches the controller
 * • Prevent invalid or malicious data from entering database
 *
 
 * "I use Joi for request-level validation to ensure
 * data integrity before interacting with MongoDB."
 **********************************************************************/

const Joi = require("joi");


/**********************************************************************
 * LISTING VALIDATION SCHEMA*
 * Validates listing form data before saving.
 **********************************************************************/
module.exports.listingSchema = Joi.object({
    listing: Joi.object({

        // Title must be string and required
        title: Joi.string().required(),

        // Description required
        description: Joi.string().required(),

        // Location required
        location: Joi.string().required(),

        // Country required
        country: Joi.string().required(),

        // Price must be number ≥ 0
        price: Joi.number().required().min(0),

        // Image is optional
        image: Joi.string().allow("", null),

        // Category must match predefined values
        category: Joi.string()
            .valid(
                "Beach", "Mountains", "Trending", "Iconic Cities", "Rooms", "Castles",
                "Arctic", "Luxe", "Farms", "Camping", "Boats", "Domes", "Tree House"
            )
            .required()

    }).required(),
});


/**********************************************************************
 * REVIEW VALIDATION SCHEMA
 
 * Validates review form data before saving.
 **********************************************************************/
module.exports.reviewSchema = Joi.object({
    review: Joi.object({

        // Rating between 1 and 5
        rating: Joi.number().required().min(1).max(5),

        // Comment required
        comment: Joi.string().required(),

    }).required(),
});