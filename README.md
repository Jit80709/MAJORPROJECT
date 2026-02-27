# 🏡 StaySphere – Vacation Stay Booking Platform


StaySphere is a full-stack property booking web application built using Node.js, Express, MongoDB, and EJS.  
The platform allows users to explore properties, make bookings, manage wishlists, write reviews, and receive personalized recommendations based on their activity.

The project follows the MVC architecture and integrates a separate Flask-based AI microservice for user-based recommendation.

---

## 🚀 Overview

StaySphere demonstrates:

- Full-stack web development using Node.js & MongoDB
- Authentication & session management
- Booking system with validation logic
- Cloud-based media storage
- Location-based map integration
- Microservice-based AI recommendation engine
- Deployment-ready structure (Render compatible)

---

## ✨ Core Features

### 🔐 Authentication System
- Secure user registration & login
- Passport.js authentication
- Session management with MongoDB store
- Flash messages for user feedback

### 🏡 Listing Management
- Create, edit, and delete listings
- Category filtering
- Search functionality
- Image upload via Cloudinary
- Mapbox geolocation integration

### 📅 Booking System
- Check-in & Check-out date selection
- Overlapping booking validation
- Booking history tracking
- Booking cancellation support

### ❤️ Wishlist System
- Add or remove listings from wishlist
- Dynamic heart toggle
- Stored in user profile

### ⭐ Review & Rating System
- 1–5 star rating system
- Comment submission
- Average rating calculation
- Author-based delete permission

### 🤖 User-Based Recommendation Engine
- Separate Flask microservice
- KMeans clustering for location similarity
- Personalized scoring based on:
  - User booking history
  - Wishlist interactions
- Ranked top recommendations returned to Node backend

---

## 🧠 System Architecture

Client (Browser)
        ↓
Node.js + Express (MVC)
        ↓
MongoDB Atlas (Database: wanderlust)
        ↓
Flask AI Microservice
        ↓
Personalized Recommendations

- Web Logic handled by Node.js
- Data stored in MongoDB Atlas
- AI logic handled in Python service

---

## 🛠 Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB (Mongoose ORM)
- Passport.js
- Express-session
- Connect-mongo

### Frontend
- EJS
- Bootstrap 5
- FontAwesome

### AI Service
- Python
- Flask
- Pandas
- Scikit-learn (KMeans Clustering)
- PyMongo

### Integrations
- Cloudinary (Image storage)
- Mapbox (Geolocation)
- Render (Deployment)

---

## 📂 Project Structure

MAJORPROJECT  
├── controllers  
├── models  
├── routes  
├── views  
├── public  
├── utils  
├── app.js  
├── package.json  
└── ml/  
  ├── ai_recommendation_model.py  
  └── requirements.txt  

---

## ⚙ Environment Variables

### Node Service
ATLASDB_URL  
MAP_TOKEN  
CLOUD_NAME  
CLOUD_API_KEY  
CLOUD_API_SECRET  
SECRET  
AI_URL  

---

## 🎯 Project Objective

This project was developed for learning and placement preparation to demonstrate:

- MVC architecture implementation  
- Authentication & session handling  
- Booking system with validation  
- Full CRUD operations  
- Microservice communication (Node ↔ Flask)  
- User-based machine learning recommendation  
- Deployment-ready production structure  

---

