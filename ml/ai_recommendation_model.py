from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from bson import ObjectId
import pandas as pd
from sklearn.cluster import KMeans

app = Flask(__name__)
CORS(app)

client = MongoClient("mongodb://localhost:27017")
db = client["wanderlust"]

@app.route("/smart-recommend", methods=["POST"])
def smart_recommend():
    data = request.get_json()
    user_id = data.get("userId")
    print(" Received request for:", user_id)

    try:
        user_obj_id = ObjectId(user_id)
    except:
        print(" Invalid user ID")
        return jsonify({"recommendations": []})

    user = db.users.find_one({"_id": user_obj_id})
    if not user:
        print(" User not found")
        return jsonify({"recommendations": []})

    bookings = list(db.bookings.find({"user": user_obj_id}))
    wishlist = user.get("wishlist", [])
    listings = list(db.listings.find({}))

    if not listings:
        return jsonify({"recommendations": []})

    # Filter only necessary fields
    for l in listings:
        l["_id"] = str(l["_id"])
        l["location"] = l.get("location", "")
        l["title"] = l.get("title", "")
        l["price"] = l.get("price", 0)
        l["image"] = l.get("image", "")

    df = pd.DataFrame(listings)

    try:
        kmeans = KMeans(n_clusters=5, n_init=10)
        df["cluster"] = kmeans.fit_predict(pd.get_dummies(df["location"]))
    except Exception as e:
        print(" Clustering failed:", e)
        df["cluster"] = 0

    liked_ids = [str(b["listing"]) for b in bookings] + [str(w) for w in wishlist]
    liked_df = df[df["_id"].isin(liked_ids)]

    if liked_df.empty:
        recommendations = df.sample(min(8, len(df)))
    else:
        top_clusters = liked_df["cluster"].value_counts().head(2).index
        filtered_df = df[df["cluster"].isin(top_clusters)]
        recommendations = filtered_df.sample(min(8, len(filtered_df)))

    # Send only selected fields
    recommendations = recommendations[["_id", "title", "location", "price", "image"]].to_dict(orient="records")
    print(" Sending", len(recommendations), "recommendations")
    return jsonify({"recommendations": recommendations})

if __name__ == "__main__":
    app.run(debug=True, port=5001)
