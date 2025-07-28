// Import the Booking model

const Booking = require("../models/booking.js");

// create Booking Handler
const createBooking = async (req, res) => {
  const { listingId, checkIn, checkOut } = req.body;
  
  // Create new Booking instance


  const booking = new Booking({
    listing: listingId,
    user: req.user._id, //Logged-in user's ID
    checkIn,
    checkOut,
  });

  //Save to the database

  await booking.save();
  req.flash("success", "Booking confirmed!"); //Flash success message & redirect to listing
  res.redirect(`/listings/${listingId}`);
};

// Cancel Booking Handler

const cancelBooking = async (req, res) => {   
  const { id } = req.params;

  const booking = await Booking.findById(id);  // Find booking by ID
  if (!booking || !booking.user.equals(req.user._id)) {   //Check ownership before canceling
    req.flash("error", "Unauthorized to cancel this booking.");
    res.redirect("/dashboard");
  }

  // Delete booking

  await Booking.findByIdAndDelete(id);
  req.flash("success", "Booking cancelled successfully.");
  res.redirect("/dashboard");
};

// Export controller functions
module.exports = { createBooking, cancelBooking };
