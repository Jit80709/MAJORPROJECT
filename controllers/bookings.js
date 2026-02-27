/**********************************************************************
 * CONTROLLERS/BOOKINGS.JS
 
 * This file contains the business logic for booking operations.
 *
 * Flow:
 * Route → calls controller
 * Controller → validates dates
 * Controller → checks availability
 * Controller → interacts with Booking model
 * MongoDB → stores booking
 
 * "This controller ensures date validation, prevents
 * double booking using overlap logic, and maintains
 * booking ownership security."
 **********************************************************************/

// Import Booking model
const Booking = require("../models/booking.js");


/**********************************************************************
 * CREATE BOOKING
 
 * Route: POST /bookings
 * Steps:
 * 1. Validate dates
 * 2. Prevent past booking
 * 3. Prevent double booking (overlap check)
 * 4. Save booking to database
 **********************************************************************/
const createBooking = async (req, res) => {

  const { listingId, checkIn, checkOut } = req.body;

  try {

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    /* ================= DATE VALIDATION ================= */

    // Ensure valid dates
    if (!checkInDate || !checkOutDate) {
      req.flash("error", "Please select valid dates.");
      return res.redirect(`/listings/${listingId}`);
    }

    // Check-out must be after check-in
    if (checkOutDate <= checkInDate) {
      req.flash("error", "Check-out must be after check-in.");
      return res.redirect(`/listings/${listingId}`);
    }

    // Prevent booking in the past
    if (checkInDate < today) {
      req.flash("error", "Cannot book past dates.");
      return res.redirect(`/listings/${listingId}`);
    }

    /* ================= OVERLAP CHECK ================= */
    /*
      Overlap Logic:
      Existing Booking overlaps if:
      existing.checkIn < new.checkOut
      AND
      existing.checkOut > new.checkIn
    */

    const existingBooking = await Booking.findOne({
      listing: listingId,
      checkIn: { $lt: checkOutDate },
      checkOut: { $gt: checkInDate },
    });

    // If overlap found → reject booking
    if (existingBooking) {
      req.flash("error", "Selected dates are already booked.");
      return res.redirect(`/listings/${listingId}`);
    }

    /* ================= CREATE BOOKING ================= */

    const booking = new Booking({
      listing: listingId,
      user: req.user._id,   // Associate booking with logged-in user
      checkIn: checkInDate,
      checkOut: checkOutDate,
    });

    await booking.save();

    req.flash("success", "Booking confirmed successfully!");
    res.redirect(`/listings/${listingId}`);

  } catch (err) {

    console.error("Booking Error:", err);
    req.flash("error", "Something went wrong while booking.");
    res.redirect(`/listings/${listingId}`);
  }
};


/**********************************************************************
 * CANCEL BOOKING
 
 * Route: DELETE /bookings/:id
 *
 * Steps:
 * 1. Find booking
 * 2. Verify ownership
 * 3. Delete booking
 **********************************************************************/
const cancelBooking = async (req, res) => {

  const { id } = req.params;

  try {

    const booking = await Booking.findById(id);

    // Authorization check
    if (!booking || !booking.user.equals(req.user._id)) {
      req.flash("error", "Unauthorized to cancel this booking.");
      return res.redirect("/dashboard");
    }

    await Booking.findByIdAndDelete(id);

    req.flash("success", "Booking cancelled successfully.");
    res.redirect("/dashboard");

  } catch (err) {

    console.error("Cancel Booking Error:", err);
    req.flash("error", "Something went wrong while cancelling.");
    res.redirect("/dashboard");
  }
};

module.exports = { createBooking, cancelBooking };