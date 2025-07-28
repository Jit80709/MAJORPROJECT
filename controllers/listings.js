const Listing = require("../models/listing.js");
const User = require("../models/user.js");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapToken = process.env.MAP_TOKEN; //Mapbox Access Token from environment variable
const geocodingClient = mbxGeocoding({ accessToken: mapToken });




module.exports.index = async (req, res) => {
  const { category, search } = req.query;
  let filter = {};

  // Filter by category if selected
  if (category) {
    filter.category = category;
  }

  // Search by location or country
  if (search) {
    filter.$or = [
      { location: { $regex: search, $options: "i" } },
      { country: { $regex: search, $options: "i" } }
    ];
  }

  const allListings = await Listing.find(filter);
  res.render("listings/index.ejs", { allListings, category, search });
};




module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};


module.exports.showListing = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id)
      .populate({
          path: "reviews",
          populate: {
              path: "author",

          },
      })
      .populate("owner");
      if (!listing) {
        req.flash("error", "Listing you requested for does not exist!");
       res.redirect("/listings");

      }
    console.log(listing);
    res.render("listings/show.ejs", {listing});

    
}; 




module.exports.createListing = async (req, res, next) => {
  const response = await geocodingClient
    .forwardGeocode({
      query: req.body.listing.location,
      limit: 1,
    })
    .send();

    const url = req.file.path;
    const filename = req.file.filename;

    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = { url, filename };

    // Ensure the entire geometry object from the API is saved
    newListing.geometry  = response.body.features[0].geometry; // This line is correct and should work

    let savedListing = await newListing.save();
    console.log(savedListing);
    req.flash("success","New Listing Created!");
    res.redirect("/listings");
};






module.exports.renderEditForm = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if(!listing) {
      req.flash("error", "Listing you requested for does not exist");
      return res.redirect("/listings");
    }

    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload","/upload/w_250"); // Use resized image for faster loading
    res.render("listings/edit.ejs", { listing, originalImageUrl });
};


module.exports.updateListing = async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

    if(typeof req.file !=="undefined") {   // If a new image was uploaded, update image
    const url = req.file.path;
    const filename = req.file.filename;
    listing.image = { url, filename };
    await listing.save();
    }


    req.flash("success","Listing Updated!");
    res.redirect(`/listings/${id}`);
};  

module.exports.destroyListing = async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success","Listing Deleted!");
    res.redirect("/listings");
};

module.exports.toggleWishlist = async (req, res) => {
  const { id } = req.params;
  const user = req.user;

  const index = user.wishlist.indexOf(id);

  if (index > -1) {
    // Already in wishlist, remove it
    user.wishlist.splice(index, 1);
  } else {
    // Not in wishlist, add it
    user.wishlist.push(id);
  }

  await user.save();

  // ✅ Proper redirect (safe and reliable)
  res.redirect(req.get("Referer") || `/listings/${id}`);
};

