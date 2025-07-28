const axios = require("axios"); //Import the Axios library for making HTTP requests

// Export the smartRecommend controller function

module.exports.smartRecommend = async (req, res) => {
  try {
    const userId = req.user?._id;  //Get the currently logged-in user's ID using optional chaining

    //Send a POST request to the Flask backend server running at port 5001
    // This backend will return personalized AI-based listing recommendations

    const response = await axios.post("http://127.0.0.1:5001/smart-recommend", {
      userId: userId, // Send userId in request body
    });

    ////  Extract the recommendations from the backend response
    // If no data is returned, fall back to an empty array

    const recommendations = response.data.recommendations || [];

   // Log the recommendations to the console for debugging purposes

    console.log(" AI Recommendations:", recommendations);

    //Render the 'smart recommendations' EJS view and pass the recommendations data

    res.render("recommendations/smart", { recommendations });
  } catch (err) {
    console.error(" AI Smart Recommendation Error:", err.message);
    res.render("recommendations/smart", { recommendations: [] });  //Render the same view with an empty list to avoid crashing the page
  }
};
