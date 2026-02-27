/**********************************************************************
 * ROUTES/BOOKINGS.JS
 * This file defines all booking-related routes.
 *
 * Flow:
 * Client Request
 *      ↓
 * app.js → /bookings
 *      ↓
 * routes/bookings.js
 *      ↓
 * controllers/bookings.js
 *      ↓
 * Booking model → MongoDB
 
 * "This router handles booking creation and cancellation.
 * It ensures authentication before allowing any booking action."
 **********************************************************************/

const express = require('express');
const router = express.Router();

// Import booking controller functions
const { createBooking, cancelBooking } = require("../controllers/bookings.js");

// Middleware to ensure user is logged in
const { isLoggedIn } = require("../views/middleware.js");


/**********************************************************************
 * CREATE BOOKING
 * Route: POST /bookings
 * Flow:
 * isLoggedIn → createBooking controller
 *
 * Controller handles:
 * - Date validation
 * - Overlap check
 * - Saving booking to DB
 **********************************************************************/
router.post(
  "/",
  isLoggedIn,
  createBooking
);


/**********************************************************************
 * CANCEL BOOKING

 * Route: DELETE /bookings/:id/cancel
 *
 * Flow:
 * isLoggedIn → cancelBooking controller
 *
 * Controller handles:
 * - Ownership verification
 * - Deleting booking
 **********************************************************************/
router.delete(
  "/:id/cancel",
  isLoggedIn,
  cancelBooking
);


// Export router to be used in app.js
module.exports = router;