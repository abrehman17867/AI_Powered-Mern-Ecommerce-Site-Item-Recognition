const mongoose = require("mongoose");
const { Schema } = mongoose;

const ratingSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "products",
    required: true,
  },
  rating: {
    type: Number,
    required: true,
  },
  createAt: {
    type: Date,
    default: Date.now(),
  },
});

// Reuse an already-registered model: Next.js re-evaluates modules on
// hot reload and across route bundles, and mongoose.model() throws
// OverwriteModelError if the same name is registered twice.
const Rating = mongoose.models.ratings || mongoose.model("ratings", ratingSchema);
module.exports = Rating;
