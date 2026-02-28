/**********************************************************************
 * CLOUDINARY + MULTER CONFIG
 * Handles image upload to Cloudinary
 **********************************************************************/

const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

// Cloudinary credentials from environment
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// Storage configuration for multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "wanderlust_DEV",

    //  VERY IMPORTANT FIX
    allowed_formats: ["png", "jpg", "jpeg"],

    // optional but good
    transformation: [{ width: 800, crop: "limit" }],
  },
});

module.exports = {
  cloudinary,
  storage,
};