const User = require("../models/user.js");
const Listing = require("../models/listing.js");
const Booking = require("../models/booking.js");


module.exports.renderSignupForm = (req,res) => {  //Show signup form to the user
    res.render("users/signup.ejs");
};


module.exports.signup = async (req,res) => { //Process user registration
    try {
        let {username, email,password} = req.body;
        const newUser = new User({email, username});  //Create a new user object (without password
        const registeredUser = await User.register(newUser,password); //Create a new user object (without password
        console.log(registeredUser);
        req.login(registeredUser,(err) => {  // Automatically log the user in after successful registration
            if (err) {
                return next(err);
            }
            req.flash("success", "Welcome to Wanderlust!");
            res.redirect("/listings");
        })

    } catch(e) {
        req.flash("error", e.message); //Show error and redirect to signup page
        res.redirect("/signup");
    }
};

module.exports.renderLoginForm = (req,res) => { //Show login form to the user
    res.render("users/login.ejs");
};

module.exports.login = async (req,res) => {  // After successful login via Passport (session-based)
    req.flash("success","Welcome back to Wanderlust!");
    let redirectUrl = res.locals.redirectUrl || "/listings"; //Redirect to saved URL or default to listings page
    res.redirect(redirectUrl);
};

module.exports.logout = (req,res,next) => { //Logout the user from the session
    req.logout((err) => {
    if(err) {
        return  next(err);
    }
    req.flash("success", "You are logged out!");
    res.redirect("/listings");

    });
};
module.exports.renderDashboard = async (req, res) => {  //Show user dashboard with personal data
    const userId = req.user._id;

    const myListings = await Listing.find({ owner: userId });  // Fetch all listings created by the user
    const myBookings = await Booking.find({ user: userId }).populate("listing"); //Fetch bookings made by the user and populate listing info
    const user = await User.findById(userId).populate("wishlist"); //Fetch wishlist with full listing details

    res.render("users/dashboard.ejs", { //Render dashboard page with all sections
        myListings,
        myBookings,
        wishlist: user.wishlist
    });
};