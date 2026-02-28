/**********************************************************************
 * CONTROLLERS/LISTINGS.JS
 * ------------------------------------------------------------
 * This file contains the business logic for all listing features.
 *
 * Flow:
 * Route File → calls controller function
 * Controller → interacts with Model (MongoDB)
 * Model → performs DB operation
 * Controller → sends response (render / redirect)

 * "Controllers contain the main business logic of my application.
 * They receive request data from routes, interact with models,
 * and return the final response."
 **********************************************************************/

const Listing = require("../models/listing.js");
const User = require("../models/user.js");
const Booking = require("../models/booking.js");

// Mapbox Geocoding setup (used while creating listing)
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

/* =====================================================
   INDEX → Show all listings (with average rating)
   Route: GET /listings
===================================================== */
module.exports.index = async (req, res) => {

  // Get search & category from query
  const { category, search } = req.query;
  let filter = {};

  // Filter by category
  if (category) {
    filter.category = category;
  }

  // Filter by search keyword
  if (search) {
    filter.$or = [
      { location: { $regex: search, $options: "i" } },
      { country: { $regex: search, $options: "i" } },
    ];
  }

  // Fetch listings from DB & populate reviews
  const listings = await Listing.find(filter).populate("reviews");

  // Calculate average rating for each listing
  const allListings = listings.map((listing) => {
    let avgRating = 0;

    if (listing.reviews && listing.reviews.length > 0) {
      const total = listing.reviews.reduce((sum, review) => {
        return sum + review.rating;
      }, 0);

      avgRating = (total / listing.reviews.length).toFixed(1);
    }

    return {
      ...listing.toObject(),
      avgRating,
    };
  });

  // Render index page
  res.render("listings/index.ejs", {
    allListings,
    category,
    search,
  });
};


/* =====================================================
   RENDER NEW FORM
   Route: GET /listings/new
===================================================== */
module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};


/* =====================================================
   SHOW SINGLE LISTING
   Route: GET /listings/:id
===================================================== */
module.exports.showListing = async (req, res) => {

  let { id } = req.params;

  // Find listing by ID & populate related data
  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: { path: "author" },
    })
    .populate("owner");

  // If listing not found
  if (!listing) {
    req.flash("error", "Listing does not exist!");
    return res.redirect("/listings");
  }

  // Get bookings for this listing
  const bookings = await Booking.find({ listing: listing._id });

  // Convert bookings into date ranges
  const bookedRanges = bookings.map((b) => ({
    from: b.checkIn,
    to: b.checkOut,
  }));

  // Calculate average rating
  let avgRating = 0;

  if (listing.reviews && listing.reviews.length > 0) {
    const total = listing.reviews.reduce((sum, review) => {
      return sum + review.rating;
    }, 0);

    avgRating = (total / listing.reviews.length).toFixed(1);
  }

  // Render show page
  res.render("listings/show.ejs", {
    listing,
    bookedRanges,
    avgRating,
  });
};


/* =====================================================
   CREATE LISTING
   Route: POST /listings
===================================================== */
/**
 * CREATE LISTING CONTROLLER

 * Purpose:
 * Creates a new property listing with:
 * - Mapbox geocoding (location → coordinates)
 * - Image upload handling (Cloudinary via multer)
 * - Owner assignment
 * - Error-safe production handling
 
 * Form → Route → Controller → MongoDB → Redirect
 */
module.exports.createListing = async (req, res, next) => {
  try {
    //  Convert location text into coordinates using Mapbox
    const geoResponse = await geocodingClient
      .forwardGeocode({
        query: req.body.listing.location,
        limit: 1,
      })
      .send();

    // Ensure image was uploaded (multer safety check)
    if (!req.file) {
      req.flash("error", "Please upload an image!");
      return res.redirect("/listings/new");
    }

    // Extract uploaded image info
    const url = req.file.path;
    const filename = req.file.filename;

    //  Create new listing from form data
    const newListing = new Listing(req.body.listing);

    // Assign current logged-in user as owner
    newListing.owner = req.user._id;

    // Attach image metadata
    newListing.image = { url, filename };

    //  Safely attach geometry if Mapbox returned result
    if (geoResponse.body.features.length > 0) {
      newListing.geometry = geoResponse.body.features[0].geometry;
    }

    //  Save listing into MongoDB
    await newListing.save();

    //  Success feedback
    req.flash("success", "New Listing Created!");
    res.redirect("/listings");

  } catch (err) {
    //  Production-safe error handling
    console.error("CREATE LISTING ERROR:", err);
    req.flash("error", "Something went wrong while creating listing.");
    res.redirect("/listings/new");
  }
};


/* =====================================================
   RENDER EDIT FORM
   Route: GET /listings/:id/edit
===================================================== */
module.exports.renderEditForm = async (req, res) => {

  let { id } = req.params;

  const listing = await Listing.findById(id);

  if (!listing) {
    req.flash("error", "Listing does not exist");
    return res.redirect("/listings");
  }

  // Resize image preview
  let originalImageUrl = listing.image.url;
  originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");

  res.render("listings/edit.ejs", { listing, originalImageUrl });
};


/* =====================================================
   UPDATE LISTING
   Route: PUT /listings/:id
===================================================== */
module.exports.updateListing = async (req, res) => {

  let { id } = req.params;

  // Update listing details
  let listing = await Listing.findByIdAndUpdate(id, {
    ...req.body.listing,
  });

  // If new image uploaded
  if (typeof req.file !== "undefined") {
    const url = req.file.path;
    const filename = req.file.filename;
    listing.image = { url, filename };
    await listing.save();
  }

  req.flash("success", "Listing Updated!");
  res.redirect(`/listings/${id}`);
};


/* =====================================================
   DELETE LISTING
   Route: DELETE /listings/:id
===================================================== */
module.exports.destroyListing = async (req, res) => {

  let { id } = req.params;

  // Delete listing from DB
  await Listing.findByIdAndDelete(id);

  req.flash("success", "Listing Deleted!");
  res.redirect("/listings");
};


/* =====================================================
   TOGGLE WISHLIST
   Route: POST /listings/:id/wishlist
===================================================== */
module.exports.toggleWishlist = async (req, res) => {

  const { id } = req.params;
  const user = req.user;

  // Check if listing already in wishlist
  const index = user.wishlist.indexOf(id);

  if (index > -1) {
    // Remove from wishlist
    user.wishlist.splice(index, 1);
  } else {
    // Add to wishlist
    user.wishlist.push(id);
  }

  // Save user update
  await user.save();

  res.redirect(req.get("Referer") || `/listings/${id}`);
};