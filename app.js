/**********************************************************************
 * APP.JS → MAIN ENTRY FILE -------------------
 * This file initializes and connects the entire backend system.
 *
 * Responsibilities:
 * • Connect to MongoDB
 * • Configure middleware
 * • Configure authentication (Passport + Sessions)
 * • Mount all route files
 * • Handle errors globally
 * • Start the server
 *
 * Architecture: MVC Pattern
 *
 * Client Request
 *     ↓
 * app.js
 *     ↓
 * routes/*.js
 *     ↓
 * controllers/*.js
 *     ↓
 * models/*.js
 *     ↓
 * MongoDB
 *     ↓
 * EJS View Response
 *

/* ================= ENVIRONMENT CONFIG ================= */
// Load environment variables in development mode
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}


/* ================= CORE MODULES ================= */

const express = require("express");
const app = express(); // Create Express application

const mongoose = require("mongoose"); // MongoDB connection
const path = require("path"); // Handle file paths safely
const methodOverride = require("method-override"); // Enable PUT & DELETE in forms
const ejsMate = require("ejs-mate"); // Layout support for EJS

// Custom error class for centralized error handling
const ExpressError = require("./utils/ExpressError.js");


/* ================= AUTHENTICATION & SESSION ================= */

const session = require("express-session"); // Manages login sessions
const MongoStore = require("connect-mongo"); // Stores session in MongoDB
const flash = require("connect-flash"); // Temporary success/error messages
const passport = require("passport"); // Authentication middleware
const LocalStrategy = require("passport-local"); // Username/password strategy

// User model used by Passport for authentication
const User = require("./models/user.js");


/* ================= ROUTE FILE IMPORTS ================= */
/*
Each route file handles a specific feature.
app.js simply connects them to the application.
*/

const listingRouter = require("./routes/listing.js");          // Listing feature
const reviewRouter = require("./routes/review.js");            // Review feature
const bookingRoutes = require("./routes/bookings.js");         // Booking feature
const userRouter = require("./routes/user.js");                // Authentication routes
const recommendationRoutes = require("./routes/recommendation.js"); // AI recommendation


/* ================= DATABASE CONNECTION ================= */

// MongoDB Atlas URL from environment variable
const dbUrl = process.env.ATLASDB_URL;

if (!dbUrl) {
  console.error(" ATLASDB_URL is not defined in environment variables.");
  process.exit(1);
}

async function main() {
  await mongoose.connect(dbUrl);
  console.log(" Connected to MongoDB");
}

main().catch((err) => {
  console.error(" MongoDB Connection Error:", err);
});

/* ================= EXPRESS CONFIGURATION ================= */

// Set EJS as template engine
app.set("view engine", "ejs");

// Set views directory
app.set("views", path.join(__dirname, "views"));

// Parse form data
app.use(express.urlencoded({ extended: true }));

// Enable PUT & DELETE methods
app.use(methodOverride("_method"));

// Enable layout system
app.engine("ejs", ejsMate);

// Serve static files (CSS, JS, images)
app.use(express.static(path.join(__dirname, "/public")));


/* ================= SESSION MANAGEMENT ================= */
/*
Login Flow:
1. User submits credentials
2. Passport verifies user
3. Session is created
4. Session stored in MongoDB
5. Browser stores session ID in cookie
*/

const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret: process.env.SECRET,
  },
  touchAfter: 24 * 3600,
});

// Handle session store errors
store.on("error", (err) => {
  console.log("Session Store Error:", err);
});

const sessionOptions = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

app.use(session(sessionOptions));
app.use(flash());


/* ================= PASSPORT CONFIGURATION ================= */
/*
LocalStrategy → username/password authentication

serializeUser   → stores user ID in session
deserializeUser → retrieves full user from session

This enables persistent login across requests.
*/

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


/* ================= GLOBAL VARIABLES ================= */
// These variables are available in all EJS templates

app.use((req, res, next) => {
  res.locals.currUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.search = req.query.search || "";
  res.locals.category = req.query.category || "";
  next();
});


/* ================= DEFAULT ROUTE ================= */

// Redirect root URL to listings page
app.get("/", (req, res) => {
  res.redirect("/listings");
});


/* ================= ROUTE MOUNTING ================= */
/*
Example Flow (Create Listing):

Browser → POST /listings
   ↓
routes/listing.js
   ↓
controllers/listings.js
   ↓
models/listing.js
   ↓
MongoDB
   ↓
Redirect / Render EJS
*/

app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/bookings", bookingRoutes);
app.use("/", userRouter);
app.use("/", recommendationRoutes);


/* ================= 404 HANDLER ================= */

// Handle unknown routes

app.all("/*splat",(req,res,next) => { 
  next(new ExpressError(400,"Page Not Found!")); 
});

/* ================= GLOBAL ERROR HANDLER ================= */

// Centralized error handling middleware
app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something Went Wrong" } = err;
  res.status(statusCode).render("error.ejs", { message });
});


/* ================= START SERVER ================= */

const port = process.env.PORT || 8080;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});