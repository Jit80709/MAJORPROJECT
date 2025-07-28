const express = require('express');
const router = express.Router();
const { createBooking, cancelBooking } = require("../controllers/bookings.js");
const {isLoggedIn} = require("../views/middleware.js");

//Route to create booking (POST)
router.post("/", isLoggedIn,createBooking);

//Route to cancel booking (DELETE)
router.delete("/:id/cancel", isLoggedIn,cancelBooking);

module.exports = router;
