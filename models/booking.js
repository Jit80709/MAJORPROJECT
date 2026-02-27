/**********************************************************************
 * MODELS/BOOKING.JS
 
 * This schema represents a booking made by a user for a listing.
 *
 * Role in MVC:
 * Controller → uses Booking model → MongoDB stores booking data

 
 * "This schema stores booking details including
 * user reference, listing reference, and date range.
 * It also validates check-out date and uses timestamps."
 **********************************************************************/

const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({

  /******************************************************************
   * LISTING REFERENCE
   
   * Connects booking to a specific listing.
   * This creates a many-to-one relationship.
   ******************************************************************/
  listing: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Listing",
    required: true,
  },

  /******************************************************************
   * USER REFERENCE
   * --------------------------------------------------------
   * Connects booking to the user who booked it.
   ******************************************************************/
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  /******************************************************************
   * CHECK-IN DATE
   ******************************************************************/
  checkIn: {
    type: Date,
    required: true,
  },

  /******************************************************************
   * CHECK-OUT DATE
   * Includes custom validation:
   * Ensures check-out date is after check-in date.
   ******************************************************************/
  checkOut: {
    type: Date,
    required: true,
    validate: {
      validator: function (value) {
        return value > this.checkIn; // Must be later than check-in
      },
      message: "Check-out date must be after check-in date.",
    },
  },

}, { timestamps: true }); 
/*
timestamps: true automatically adds:
• createdAt
• updatedAt

Useful for tracking booking history.
*/

// Create Booking model
module.exports = mongoose.model("Booking", bookingSchema);