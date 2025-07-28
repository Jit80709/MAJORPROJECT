const express = require("express");
const router = express.Router();
const { isLoggedIn } = require("../views/middleware.js");
const recommendationController = require("../controllers/recommendationController.js");

// Smart AI Recommendation Route (auto based on user history)
router.get("/smart", isLoggedIn, recommendationController.smartRecommend);



module.exports = router;
