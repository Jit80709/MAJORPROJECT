/**********************************************************************
 * ROUTES/REVIEW.JS
 
 * This file handles all review-related routes.
 *
 * Important:
 * This router is nested under:
 * /listings/:id/reviews
 *
 * Example:
 * POST   /listings/:id/reviews
 * DELETE /listings/:id/reviews/:reviewId
 *

 
 * "This router manages review creation and deletion.
 * It maintains the relationship between listings and reviews."
 **********************************************************************/

const express = require("express");

// mergeParams: true is required to access parent route parameter (:id)
const router = express.Router({ mergeParams: true });

const WrapAsync = require("../utils/WrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");

const Review = require("../models/review.js");
const Listing = require("../models/listing.js");

// Custom middleware
// validateReview → validates review form data
// isLoggedIn → checks authentication
// isReviewAuthor → checks review ownership before delete
const { validateReview, isLoggedIn, isReviewAuthor } = require("../views/middleware.js");

// Import review controller
const reviewController = require("../controllers/reviews.js");


/**********************************************************************
 * CREATE REVIEW
 
 * Route: POST /listings/:id/reviews
 *
 * Flow:
 * isLoggedIn → validateReview → controller.createReview
 *
 * Controller will:
 * 1. Find listing
 * 2. Create review
 * 3. Attach review to listing
 * 4. Save both
 **********************************************************************/
router.post(
  "/",
  isLoggedIn,
  validateReview,
  WrapAsync(reviewController.createReview)
);


/**********************************************************************
 * DELETE REVIEW
 
 * Route: DELETE /listings/:id/reviews/:reviewId
 
 * Flow:
 * isLoggedIn → isReviewAuthor → controller.destroyReview
 
 * Controller will:
 * 1. Remove review reference from listing
 * 2. Delete review document
 **********************************************************************/
router.delete(
  "/:reviewId",
  isLoggedIn,
  isReviewAuthor,
  WrapAsync(reviewController.destroyReview)
);


module.exports = router;