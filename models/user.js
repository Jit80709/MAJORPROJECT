/**********************************************************************
 * MODELS/USER.JS
 
 * This schema represents application users.
 *
 * Responsibilities:
 * • Store user email
 * • Store wishlist (relation with Listing)
 * • Handle authentication using Passport
 
 
 * "The User model manages authentication and stores
 * user-related data like email and wishlist.
 * It integrates Passport using passport-local-mongoose."
 **********************************************************************/

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Passport plugin for handling username/password authentication
const passportLocalMongoose = require("passport-local-mongoose");


/**********************************************************************
 * USER SCHEMA
 **********************************************************************/
const userSchema = new Schema({

    // User email (required field)
    email: {
        type: String,
        required: true,
    },

    /******************************************************************
     * WISHLIST
     
     * Stores ObjectId references to Listing documents.
     * Relationship:
     * One User → Many Listings (wishlist items)
     ******************************************************************/
    wishlist: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Listing"
        }
    ],
});


/**********************************************************************
 * PASSPORT PLUGIN
 
 * passportLocalMongoose automatically adds:
 * • username field
 * • hashed password
 * • salt
 * • authentication methods
 * • serializeUser / deserializeUser helpers
 *
 * This removes the need to manually handle password hashing.
 **********************************************************************/
userSchema.plugin(passportLocalMongoose);


// Create User model
module.exports = mongoose.model("User", userSchema);