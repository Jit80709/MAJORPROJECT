/**********************************************************************
 * MODELS/REVIEW.JS
 * ------------------------------------------------------------
 * This file defines the schema for Review documents.
 *
 * Role in MVC:
 * Controller → uses Review model → MongoDB stores review data
 *
 * Relationship:
 * • Each Review belongs to one Listing (via Listing.reviews array)
 * • Each Review is written by one User (author reference)
 
 * "This schema represents user reviews for a listing.
 * It stores rating, comment, author reference, and
 * automatically tracks when the review was created."
 **********************************************************************/

const mongoose = require("mongoose");
const Schema = mongoose.Schema;


/**********************************************************************
 * REVIEW SCHEMA
 **********************************************************************/
const reviewSchema = new Schema({

  /* =====================================================
     COMMENT FIELD
     Stores user-written review text
  ===================================================== */
  comment: {
    type: String,
    required: true,   // Prevent empty reviews
  },


  /* =====================================================
     RATING FIELD
     Numeric star rating between 1 and 5
  ===================================================== */
  rating: {
    type: Number,
    min: 1,            // Minimum allowed rating
    max: 5,            // Maximum allowed rating
    required: true,    // Ensures rating is always provided
  },


  /* =====================================================
     CREATED AT FIELD
     Automatically stores timestamp when review is created
     IMPORTANT:
     Use Date.now (without parentheses)
     so it runs at document creation time
  ===================================================== */
  createdAt: {
    type: Date,
    default: Date.now,
  },


  /* =====================================================
     AUTHOR REFERENCE
     Links review to a specific User document
     Enables populate("author")
  ===================================================== */
  author: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

});


/**********************************************************************
 * EXPORT MODEL
 **********************************************************************/
module.exports = mongoose.model("Review", reviewSchema);