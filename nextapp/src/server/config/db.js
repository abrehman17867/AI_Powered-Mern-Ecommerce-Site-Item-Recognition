const mongoose = require("mongoose");
require("dotenv").config();

const mongodbUrl = process.env.MONGODB_URL;

const connectDb = async () => {
  if (!mongodbUrl?.trim()) {
    throw new Error(
      "MONGODB_URL is missing. Add it to backend/.env (Atlas connection string or mongodb://127.0.0.1:27017/ecommerce for local MongoDB)."
    );
  }

  try {
    await mongoose.connect(mongodbUrl, {
      serverSelectionTimeoutMS: 20000,
    });
    console.log("MongoDB connected");
  } catch (err) {
    console.error("\n--- MongoDB connection failed ---\n");
    console.error(err.message);
    console.error(`
Common fixes (MongoDB Atlas):
  1. Open https://cloud.mongodb.com → your project → Network Access
  2. Click "Add IP Address" → "Add Current IP Address" (or for local dev only: 0.0.0.0/0)
  3. Database → Clusters → ensure the cluster is Running (not Paused)
  4. Database → Connect → Drivers → copy a fresh connection string into backend/.env as MONGODB_URL
  5. Confirm the database user password in the URL is correct (special chars must be URL-encoded)

Local alternative (no Atlas):
  Install MongoDB locally or run: docker run -d -p 27017:27017 mongo:7
  Then set: MONGODB_URL=mongodb://127.0.0.1:27017/ecommerce
`);
    throw err;
  }
};

module.exports = { connectDb };
