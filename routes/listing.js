const express = require("express");
const router = express.Router();
const WrapAsync = require("../utils/WrapAsync.js");
const Listing = require("../models/listing.js");
const User = require("../models/user.js");

const { isLoggedIn, isOwner, validateListing } = require('../views/middleware.js');
const listingController = require("../controllers/listings.js");


const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage});







router
  .route("/")
  .get(WrapAsync(listingController.index)) // Correct: no path inside
  .post(
    isLoggedIn,
    upload.single("listing[image]"),
    validateListing,
    WrapAsync(listingController.createListing)
  );


//New Route
router.get("/new",isLoggedIn,listingController.renderNewForm); 



router.post("/:id/wishlist", isLoggedIn, WrapAsync(listingController.toggleWishlist));


router
  .route("/:id")
  .get(WrapAsync(listingController.showListing))
  .put(
    isLoggedIn,
    isOwner,
    upload.single("listing[image]"),
    validateListing, 
    WrapAsync(listingController.updateListing)
  )
  .delete(
    isLoggedIn,
    isOwner,
    WrapAsync(listingController.destroyListing)
  );


//Edit Route
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  WrapAsync(listingController.renderEditForm)
);




module.exports = router;
 