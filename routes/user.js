/**********************************************************************
 * ROUTES/USER.JS
 
 * This file handles all user-related routes:
 * - Signup
 * - Login
 * - Logout
 * - Dashboard
 * - Wishlist management
 *
 * Flow:
 * Route → Controller / Passport → Model → Response
 
 * "This router manages authentication, session-based login,
 * protected dashboard access, and user wishlist operations."
 **********************************************************************/

const express = require("express");
const router = express.Router();

const User = require("../models/user.js");
const WrapAsync = require("../utils/WrapAsync.js");
const passport = require("passport");

const { saveRedirectUrl, isLoggedIn } = require("../views/middleware.js");
const userController = require("../controllers/users.js");


/**********************************************************************
 * SIGNUP ROUTES
 
 * GET  /signup → Render signup form
 * POST /signup → Create new user
 **********************************************************************/
router.route("/signup")
    .get(userController.renderSignupForm)
    .post(WrapAsync(userController.signup));


/**********************************************************************
 * LOGIN ROUTES
 
 * GET  /login → Render login form
 * POST /login → Authenticate using Passport
 *
 * Flow:
 * saveRedirectUrl → passport.authenticate → controller.login
 **********************************************************************/
router.route("/login")
    .get(userController.renderLoginForm)
    .post(
        saveRedirectUrl,
        passport.authenticate("local", {
            failureRedirect: "/login",
            failureFlash: true,
        }),
        userController.login
    );


/**********************************************************************
 * LOGOUT ROUTE
 
 * GET /logout → Ends session
 **********************************************************************/
router.get("/logout", userController.logout);


/**********************************************************************
 * DASHBOARD ROUTE (Protected)

 * GET /dashboard
 * Only accessible if user is logged in
 **********************************************************************/
router.get("/dashboard", isLoggedIn, userController.renderDashboard);


/**********************************************************************
 * REMOVE FROM WISHLIST
 
 * POST /wishlist/:id/remove
 * Removes listing from user's wishlist
 **********************************************************************/
router.post("/wishlist/:id/remove", isLoggedIn, async (req, res) => {

    const { id } = req.params;
    const userId = req.user._id;

    // Remove listing from wishlist array
    await User.findByIdAndUpdate(userId, {
        $pull: { wishlist: id }
    });

    req.flash("success", "Listing removed from your wishlist.");
    res.redirect("/dashboard");
});


module.exports = router;