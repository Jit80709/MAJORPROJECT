/**********************************************************************
 * CONTROLLERS/RECOMMENDATIONCONTROLLER.JS
 
 * This controller handles AI-based smart recommendations.
 *
 * High-Level Flow:
 * Browser → routes/recommendation.js → this controller
 *        → Python AI service → recommendations → EJS view
 
 * "This controller communicates with an external AI microservice
 * to generate personalized recommendations for the logged-in user."
 **********************************************************************/

const axios = require("axios"); // Used to call external AI API


/**********************************************************************
 * FUNCTION: smartRecommend
 
 * Route: GET /smart
 *
 * Purpose:
 * • Fetch personalized recommendations for the logged-in user
 * • Call Python AI service
 * • Render recommendation page
 **********************************************************************/

module.exports.smartRecommend = async (req, res) => {
  try {
    //  Safety check: if user is not logged in
    // (Normally protected by isLoggedIn middleware)
    if (!req.user) {
      return res.render("recommendations/smart", {
        recommendations: [],
      });
    }

    //  Get current user ID from session
    const userId = req.user._id;

    /**************************************************************
     * Call external AI service (Python backend)
     *
     * Flow:
     * Node.js → axios POST → Python AI server → returns suggestions
     **************************************************************/
    const response = await axios.post(
      process.env.AI_URL + "/smart-recommend",
      { userId },
      {
        headers: { "Content-Type": "application/json" },
        timeout: 60000 // (60 sec)
      }
    );

    console.log("AI URL:", process.env.AI_URL);
    console.log("AI RESPONSE:", response.data);

    // Extract recommendations safely
    const recommendations = response.data.recommendations || [];

    // Debug log (useful during development)
    console.log("AI Recommendations:", recommendations);

    //  Render recommendations page with AI data
    res.render("recommendations/smart", { recommendations });

  } catch (err) {
    //  If AI service fails, handle gracefully
    console.error("AI Smart Recommendation Error:", err.message);

    // Show empty recommendations instead of crashing app
    res.render("recommendations/smart", {
      recommendations: [],
    });
  }
};