const Listing = require("../models/listing.js"); //// Import the Listing and Review models
const Review = require("../models/review");



// Controller to handle creating a new review

module.exports.createReview = async (req, res) => {
    const listing = await Listing.findById(req.params.id); //Find the listing by ID from the URL parameter
    const newReview = new Review(req.body.review); // Create a new review using the submitted form data
    newReview.author = req.user._id; // Create a new review using the submitted form data

    
    listing.reviews.push(newReview);

    
    await newReview.save(); //Save both the review and the listing to the database
    await listing.save(); 
    req.flash("success", "New Review Created!");
    res.redirect(`/listings/${listing._id}`);
};

module.exports.destroyReview = async (req, res) => {
    let { id,reviewId } = req.params; // Remove the review reference from the listing's reviews array

    await Listing.findByIdAndUpdate( id, {$pull: {reviews: reviewId}});  //Mongoose operator to remove by value

    await Review.findByIdAndDelete(reviewId);  //Delete the actual review document from the database
    req.flash("success","Review Deleted!");
    res.redirect(`/listings/${id}`);
};    