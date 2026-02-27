/**********************************************************************
 * MODELS/LISTING.JS
 * This file defines the MongoDB schema for Listings.
 
 * Responsibility:
 * • Defines structure of listing documents
 * • Defines relationships (reviews, owner)
 * • Adds post-delete cleanup logic
 
 * MVC Role:
 * Controller → uses this model → MongoDB stores data
 
 * "This schema represents a property listing. It stores
 * basic details, owner reference, review references,
 * and geographic coordinates for map integration."
 **********************************************************************/

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Review model used for cascade delete
const Review = require("./review.js");


/**********************************************************************
 * LISTING SCHEMA DEFINITION
 **********************************************************************/
const listingSchema = new Schema({

  // Title of the property
  title: {
    type: String,
    required: true,
  },

  // Description of the listing
  description: String,

  // Image stored via Cloudinary
  image: {
    url: String,        // Cloudinary image URL
    filename: String,   // Cloudinary filename
  },
  
  price: Number,

  location: String,

  country: String,

  // Category filter (used in search/filter UI)
  category: {
    type: String,
    enum: [
      "Beach",
      "Mountains",
      "Trending",
      "Iconic Cities",
      "Rooms",
      "Castles",
      "Arctic",
      "Luxe",
      "Farms",
      "Camping",
      "Boats",
      "Domes",
      "Tree House",
    ],
    required: true,
  },

  /******************************************************************
   * REVIEWS RELATION
   
   * Stores ObjectIds of Review documents.
   * Used with populate() to fetch full review data.
   ******************************************************************/
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],

  /******************************************************************
   * OWNER RELATION
   
   * References the User who created the listing.
   ******************************************************************/
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },

  /******************************************************************
   * GEOMETRY (MAPBOX INTEGRATION)
   
   * Stores coordinates for map display.
   * Used for geolocation features.
   ******************************************************************/
  geometry: {
    type: {
      type: String,
      enum: ["Point"],
      required: true,
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
    },
  },
});


/**********************************************************************
 * POST MIDDLEWARE: CASCADE DELETE REVIEWS

 * When a listing is deleted,
 * automatically delete all associated reviews.
 *
 * Triggered on:
 * Listing.findByIdAndDelete()
 * Listing.findOneAndDelete()
 *
 * This prevents orphan reviews in database.
 **********************************************************************/
listingSchema.post("findOneAndDelete", async (listing) => {
  if (listing) {
    await Review.deleteMany({ _id: { $in: listing.reviews } });
  }
});


// Create Listing model
const Listing = mongoose.model("Listing", listingSchema);

// Export model to be used in controllers
module.exports = Listing;