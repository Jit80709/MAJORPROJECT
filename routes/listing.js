/**********************************************************************
 * ROUTES/LISTING.JS
 * ------------------------------------------------------------
 * This file handles all listing-related routes.
 *
 * Flow:
 * Browser Request
 *      ↓
 * app.js  →  "/listings"
 *      ↓
 * routes/listing.js
 *      ↓
 * controllers/listings.js
 *      ↓
 * models/listing.js
 *      ↓
 * MongoDB
 * 
 * "This file defines all CRUD operations related to listings
 * and delegates business logic to the listing controller."
 **********************************************************************/

const express = require("express");
const router = express.Router(); // Create router object

// Utility to handle async errors automatically
const WrapAsync = require("../utils/WrapAsync.js");

// Listing model (used indirectly through controller)
const Listing = require("../models/listing.js");

// User model (used for wishlist feature)
const User = require("../models/user.js");

// Custom middleware
// isLoggedIn → checks if user is logged in
// isOwner → checks if user owns the listing
// validateListing → validates form data
const { isLoggedIn, isOwner, validateListing } = require('../views/middleware.js');

// Import listing controller (business logic layer)
const listingController = require("../controllers/listings.js");

// Multer for image upload
const multer = require("multer");

// Cloudinary storage configuration
const { storage } = require("../cloudConfig.js");

// Configure multer with cloud storage
const upload = multer({ storage });


/**********************************************************************
 * ROUTE: "/"
 * GET  /listings        → Show all listings
 * POST /listings        → Create new listing
 **********************************************************************/

router
  .route("/")

  // Show all listings
  // Flow: GET /listings → controller.index → fetch from DB → render page
  .get(WrapAsync(listingController.index))

  // Create new listing
  // Flow:
  // isLoggedIn → upload image → validate data → create listing in DB
  .post(
    isLoggedIn,
    upload.single("listing[image]"),
    validateListing,
    WrapAsync(listingController.createListing)
  );


/**********************************************************************
 * ROUTE: "/new"
 * GET /listings/new
 * Renders form to create a new listing
 **********************************************************************/

router.get(
  "/new",
  isLoggedIn,
  listingController.renderNewForm
);


/**********************************************************************
 * ROUTE: "/:id/wishlist"
 * POST /listings/:id/wishlist
 * Adds or removes listing from user's wishlist
 **********************************************************************/

router.post(
  "/:id/wishlist",
  isLoggedIn,
  WrapAsync(listingController.toggleWishlist)
);


/**********************************************************************
 * ROUTE: "/:id"
 * GET    /listings/:id      → Show single listing
 * PUT    /listings/:id      → Update listing
 * DELETE /listings/:id      → Delete listing
 **********************************************************************/

router
  .route("/:id")

  // Show single listing
  // Flow: controller.showListing → findById → render details page
  .get(WrapAsync(listingController.showListing))

  // Update listing
  // Flow:
  // Check login → Check ownership → Upload image (if any)
  // → Validate → Update DB
  .put(
    isLoggedIn,
    isOwner,
    upload.single("listing[image]"),
    validateListing,
    WrapAsync(listingController.updateListing)
  )

  // Delete listing
  // Flow:
  // Check login → Check ownership → Delete from DB
  .delete(
    isLoggedIn,
    isOwner,
    WrapAsync(listingController.destroyListing)
  );


/**********************************************************************
 * ROUTE: "/:id/edit"
 * GET /listings/:id/edit
 * Renders edit form for listing
 **********************************************************************/

router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  WrapAsync(listingController.renderEditForm)
);


// Export router to be used in app.js
module.exports = router;