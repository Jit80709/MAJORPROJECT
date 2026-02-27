/**********************************************************************
 * CONTROLLERS/USERS.JS
 
 * This file contains all authentication and user-related logic:
 * - Signup
 * - Login
 * - Logout
 * - Dashboard
 *
 * Flow:
 * Route → Controller → Model → Response
 
 
 * "This controller manages user authentication using Passport,
 * session handling, and dashboard data aggregation."
 **********************************************************************/

const User = require("../models/user.js");
const Listing = require("../models/listing.js");
const Booking = require("../models/booking.js");


/**********************************************************************
 * RENDER SIGNUP FORM
 
 * Route: GET /signup
 **********************************************************************/
module.exports.renderSignupForm = (req, res) => {
    res.render("users/signup.ejs");
};


/**********************************************************************
 * SIGNUP LOGIC
 
 * Route: POST /signup
 *
 * Steps:
 * 1. Create new User object
 * 2. Register using passport-local-mongoose
 * 3. Auto-login user
 * 4. Redirect to listings
 **********************************************************************/
module.exports.signup = async (req, res) => {
    try {
        let { username, email, password } = req.body;

        // Create new user (without password)
        const newUser = new User({ email, username });

        // Register user (hashes password automatically)
        const registeredUser = await User.register(newUser, password);

        // Automatically log in after signup
        req.login(registeredUser, (err) => {
            if (err) {
                return next(err);
            }
            req.flash("success", "Welcome to Wanderlust!");
            res.redirect("/listings");
        });

    } catch (e) {
        req.flash("error", e.message);
        res.redirect("/signup");
    }
};


/**********************************************************************
 * RENDER LOGIN FORM
 
 * Route: GET /login
 **********************************************************************/
module.exports.renderLoginForm = (req, res) => {
    res.render("users/login.ejs");
};


/**********************************************************************
 * LOGIN SUCCESS HANDLER
 
 * Route: POST /login
 * (Passport authentication already done before this)
 *
 * Steps:
 * 1. Show success message
 * 2. Redirect to saved URL or default page
 **********************************************************************/
module.exports.login = async (req, res) => {

    req.flash("success", "Welcome back to Wanderlust!");

    // Redirect to originally requested page (if exists)
    let redirectUrl = res.locals.redirectUrl || "/listings";

    res.redirect(redirectUrl);
};


/**********************************************************************
 * LOGOUT
 
 * Route: GET /logout
 *
 * Ends session and removes user authentication
 **********************************************************************/
module.exports.logout = (req, res, next) => {

    req.logout((err) => {
        if (err) {
            return next(err);
        }

        req.flash("success", "You are logged out!");
        res.redirect("/listings");
    });
};


/**********************************************************************
 * RENDER DASHBOARD
 
 * Route: GET /dashboard (Protected)
 *
 * Shows:
 * - Listings created by user
 * - Bookings made by user
 * - Wishlist items
 **********************************************************************/
module.exports.renderDashboard = async (req, res) => {

    const userId = req.user._id;

    // Listings created by user
    const myListings = await Listing.find({ owner: userId });

    // Bookings made by user (with listing details)
    const myBookings = await Booking.find({ user: userId })
        .populate("listing");

    // Wishlist items
    const user = await User.findById(userId)
        .populate("wishlist");

    res.render("users/dashboard.ejs", {
        myListings,
        myBookings,
        wishlist: user.wishlist
    });
};