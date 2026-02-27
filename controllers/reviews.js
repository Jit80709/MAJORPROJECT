/**********************************************************************
 * CONTROLLERS/REVIEWS.JS
 
 * This file contains the business logic for review operations.
 *
 * Flow:
 * Route → calls controller
 * Controller → interacts with Listing & Review models
 * Model → updates MongoDB
 * Controller → redirects to listing page
 

 * "This controller manages creating and deleting reviews.
 * It maintains the relationship between Listing and Review
 * collections."
 **********************************************************************/

const Listing = require("../models/listing.js");
const Review = require("../models/review");      


/**********************************************************************
 * CREATE REVIEW
 
 * Route: POST /listings/:id/reviews
 *
 * Steps:
 * 1. Find the listing
 * 2. Create new review
 * 3. Attach review to listing
 * 4. Save both in database
 * 5. Redirect to listing page
 **********************************************************************/
module.exports.createReview = async (req, res) => {

    // Find listing using ID from URL
    const listing = await Listing.findById(req.params.id);

    // Create new review from form data
    const newReview = new Review(req.body.review);

    // Assign current logged-in user as author
    newReview.author = req.user._id;

    // Add review reference to listing
    listing.reviews.push(newReview);

    // Save review document
    await newReview.save();

    // Save updated listing
    await listing.save();

    req.flash("success", "New Review Created!");

    // Redirect back to listing details page
    res.redirect(`/listings/${listing._id}`);
};


/**********************************************************************
 * DELETE REVIEW
 
 * Route: DELETE /listings/:id/reviews/:reviewId
 *
 * Steps:
 * 1. Remove review reference from listing
 * 2. Delete review document from database
 * 3. Redirect back to listing page
 **********************************************************************/
module.exports.destroyReview = async (req, res) => {

    let { id, reviewId } = req.params;

    // Remove review ID from listing's reviews array
    await Listing.findByIdAndUpdate(id, {
        $pull: { reviews: reviewId }   // $pull removes value from array
    });

    // Delete review document from Review collection
    await Review.findByIdAndDelete(reviewId);

    req.flash("success", "Review Deleted!");

    // Redirect back to listing page
    res.redirect(`/listings/${id}`);
};