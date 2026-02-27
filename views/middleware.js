/**********************************************************************
 * MIDDLEWARE.JS
 
 * This file contains custom middleware functions used
 * for authentication, authorization, and validation.
 *
 * Types of Middleware:
 * 1. Authentication → isLoggedIn
 * 2. Authorization  → isOwner, isReviewAuthor
 * 3. Validation     → validateListing, validateReview
 *
 
 * "This file centralizes security and validation logic.
 * It ensures only authorized users can modify data,
 * and validates input before saving to database."
 **********************************************************************/

const Listing = require("../models/listing.js");
const Review = require("../models/review.js");
const ExpressError = require("../utils/ExpressError.js");

// Joi validation schemas
const { listingSchema, reviewSchema } = require("../schema.js");


/**********************************************************************
 * AUTHENTICATION MIDDLEWARE
 
 * Checks if user is logged in.
 * If not logged in:
 * - Saves original URL
 * - Redirects to login page
 **********************************************************************/
module.exports.isLoggedIn = (req, res, next) => {

    if (!req.isAuthenticated()) {

        // Save original URL to redirect after login
        req.session.redirectUrl = req.originalUrl;

        req.flash("error", "You must be logged in to create listing!");
        return res.redirect("/login");
    }

    next();
};


/**********************************************************************
 * SAVE REDIRECT URL
 
 * After successful login, redirect user
 * to originally requested page.
 **********************************************************************/
module.exports.saveRedirectUrl = (req, res, next) => {

    if (req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
    }

    next();
};


/**********************************************************************
 * AUTHORIZATION MIDDLEWARE (Listing Owner)
 
 * Ensures only the listing owner can edit/delete.
 **********************************************************************/
module.exports.isOwner = async (req, res, next) => {

    let { id } = req.params;

    let listing = await Listing.findById(id);

    // Compare owner ID with logged-in user ID
    if (!listing.owner.equals(res.locals.currUser._id)) {

        req.flash("error", "You are not the owner of this listing");
        return res.redirect(`/listings/${id}`);
    }

    next();
};


/**********************************************************************
 * VALIDATE LISTING DATA
 
 * Uses Joi schema to validate incoming form data.
 * Prevents invalid data from entering database.
 **********************************************************************/
module.exports.validateListing = (req, res, next) => {

    let { error } = listingSchema.validate(req.body);

    if (error) {

        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);

    } else {
        next();
    }
};


/**********************************************************************
 * VALIDATE REVIEW DATA
 * Validates review form before saving.
 **********************************************************************/
module.exports.validateReview = (req, res, next) => {

    let { error } = reviewSchema.validate(req.body);

    if (error) {

        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);

    } else {
        next();
    }
};


/**********************************************************************
 * AUTHORIZATION MIDDLEWARE (Review Author)
 
 * Ensures only the review author can delete the review.
 **********************************************************************/
module.exports.isReviewAuthor = async (req, res, next) => {

    let { id, reviewId } = req.params;

    let review = await Review.findById(reviewId);

    // Check if logged-in user is review author
    if (!review.author.equals(res.locals.currUser._id)) {

        req.flash("error", "You are not the author of this review");
        return res.redirect(`/listings/${id}`);
    }

    next();
};