"""
AI RECOMMENDATION MICROSERVICE (Flask + Machine Learning)
--------------------------------------------------------------------

This service works separately from the main Node.js backend.

Overall System Flow:

User (Browser)
    ↓
Node.js (Express Backend)
    ↓
Axios POST Request
    ↓
Flask AI Service (/smart-recommend)
    ↓
MongoDB Data Fetch
    ↓
Machine Learning Logic (KMeans Clustering)
    ↓
Scoring & Ranking
    ↓
JSON Response → Node.js → Render EJS View

"I separated the AI logic into a Flask microservice.
Node.js handles web logic, and Flask handles ML-based
recommendation processing."
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from bson import ObjectId
import pandas as pd
from sklearn.cluster import KMeans
import os
from dotenv import load_dotenv


# ================= LOAD ENV VARIABLES =================
load_dotenv()

# Create Flask app
app = Flask(__name__)

# Enable CORS so Node.js backend can call this API
CORS(app)


# ================= DATABASE CONNECTION =================

# Get MongoDB Atlas connection string
mongo_url = os.getenv("ATLASDB_URL")

# Create MongoDB client
client = MongoClient(mongo_url)

# Select database
db = client["wanderlust"]


# ======================================================
# ROUTE: /smart-recommend
# METHOD: POST
# PURPOSE:
# Generate personalized recommendations for a user
# ======================================================

@app.route("/smart-recommend", methods=["POST"])
def smart_recommend():

    # Get JSON data sent from Node.js
    data = request.get_json()
    user_id = data.get("userId")

    # Convert string ID into MongoDB ObjectId
    try:
        user_obj_id = ObjectId(user_id)
    except:
        return jsonify({"recommendations": []})

    # Fetch user from database
    user = db.users.find_one({"_id": user_obj_id})
    if not user:
        return jsonify({"recommendations": []})

    # Fetch user booking history
    bookings = list(db.bookings.find({"user": user_obj_id}))

    # Fetch user's wishlist
    wishlist = user.get("wishlist", [])

    # Fetch all listings
    listings = list(db.listings.find({}))
    if not listings:
        return jsonify({"recommendations": []})


    # ================= DATA PREPARATION =================
    # Clean and normalize listing fields

    for l in listings:
        l["_id"] = str(l["_id"])
        l["location"] = l.get("location", "")
        l["title"] = l.get("title", "")
        l["price"] = l.get("price", 0)

        # Extract image URL safely
        if isinstance(l.get("image"), dict):
            l["image"] = l["image"].get("url", "")
        else:
            l["image"] = l.get("image", "")

    # Convert listings into Pandas DataFrame
    df = pd.DataFrame(listings)


    # ================= MACHINE LEARNING (KMeans) =================
    # Cluster listings based on location similarity

    try:
        kmeans = KMeans(n_clusters=5, n_init=10)
        df["cluster"] = kmeans.fit_predict(
            pd.get_dummies(df["location"])
        )
    except:
        df["cluster"] = 0


    # ================= USER PREFERENCE DETECTION =================

    # Combine booking + wishlist listing IDs
    liked_ids = [str(b["listing"]) for b in bookings] + \
                [str(w) for w in wishlist]

    # Get listings user interacted with
    liked_df = df[df["_id"].isin(liked_ids)]

    # Detect top preferred clusters
    if liked_df.empty:
        preferred_clusters = []
    else:
        preferred_clusters = (
            liked_df["cluster"]
            .value_counts()
            .head(2)
            .index
            .tolist()
        )


    # ================= SCORING SYSTEM =================
    # Assign score based on similarity and interaction

    recommendations = []

    for _, row in df.iterrows():

        score = 0
        reason = "Popular listing on platform"

        # Location similarity boost
        if row["cluster"] in preferred_clusters:
            score += 50
            reason = "Similar to your preferred locations"

        # Wishlist boost
        if row["_id"] in [str(w) for w in wishlist]:
            score += 30
            reason = "From your wishlist"

        # Previous booking boost
        if row["_id"] in [str(b["listing"]) for b in bookings]:
            score += 20
            reason = "Previously booked location"

        # Base score if no specific preference
        if score == 0:
            score = 60

        # Cap maximum score
        score = min(score, 98)

        recommendations.append({
            "_id": row["_id"],
            "title": row["title"],
            "location": row["location"],
            "price": row["price"],
            "image": row["image"],
            "matchScore": score,
            "reason": reason
        })


    # ================= SORT & RETURN =================

    # Sort recommendations by highest score
    recommendations = sorted(
        recommendations,
        key=lambda x: x["matchScore"],
        reverse=True
    )

    # Return top 8 recommendations
    return jsonify({"recommendations": recommendations[:8]})


# ================= START FLASK SERVER =================
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5001))
    app.run(host="0.0.0.0", port=port)