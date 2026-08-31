const mongoose = require("mongoose");

/**
 * Serverless-safe Mongoose connection.
 *
 * On Vercel each function invocation may reuse a warm container, so we cache the
 * connection promise on `globalThis` to avoid opening a new pool per request
 * (which exhausts Atlas connection limits fast).
 */
const MONGODB_URL = process.env.MONGODB_URL;

let cached = globalThis.__mongooseCache;
if (!cached) {
  cached = globalThis.__mongooseCache = { conn: null, promise: null };
}

async function connectDb() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!MONGODB_URL?.trim()) {
    throw new Error(
      "MONGODB_URL is missing. Add it to .env.local (local) or the Vercel project environment variables."
    );
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URL, {
        serverSelectionTimeoutMS: 20000,
        // Keep the pool small — serverless spreads load across many containers.
        maxPoolSize: 10,
        bufferCommands: false,
      })
      .then((m) => m);
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null;
    throw err;
  }

  return cached.conn;
}

module.exports = { connectDb };
