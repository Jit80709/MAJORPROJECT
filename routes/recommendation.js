/**********************************************************************
 * ROUTES/RECOMMENDATION.JS

 * This file handles AI-based recommendation routes.
 *
 * Flow:
 * Browser Request
 *      ↓
 * app.js  (mounted at "/")
 *      ↓
 * routes/recommendation.js
 *      ↓
 * controllers/recommendationController.js
 *      ↓
 * AI logic / ML processing
 *      ↓
 * Recommended listings sent to view
 
 
 * "This route connects user requests to the AI recommendation
 * controller which generates personalized suggestions."
 **********************************************************************/

const express = require("express");
const router = express.Router(); // Create router object

// Middleware to check if user is logged in
// Only authenticated users can access smart recommendations
const { isLoggedIn } = require("../views/middleware.js");

// Import recommendation controller
// This file contains AI logic and business logic
const recommendationController = require("../controllers/recommendationController.js");


/**********************************************************************
 * ROUTE: "/smart"
 
 * GET /smart
 *
 * Purpose:
 * Generate personalized recommendations based on user activity.
 
 * 1. User must be logged in (isLoggedIn middleware)
 * 2. recommendationController.smartRecommend runs
 * 3. Controller fetches user data (history/wishlist/etc.)
 * 4. AI logic processes data
 * 5. Recommended listings are returned and rendered
 **********************************************************************/

router.get(
  "/smart",
  isLoggedIn,
  recommendationController.smartRecommend
);


// Export router to app.js
module.exports = router;