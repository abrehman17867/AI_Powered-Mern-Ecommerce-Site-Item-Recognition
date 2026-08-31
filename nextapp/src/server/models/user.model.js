const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  // role: {
  //   type: String,
  //   required: true,
  //   default: "CUSTOMER",
  // },
  role: {
    type: String,
    enum: ["CUSTOMER", "ADMIN"],
    default: "CUSTOMER",
  },
  mobile: {
    type: String,
  },
  address: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "addresses",
    },
  ],
  payementInformation: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "payment_information",
    },
  ],
  ratings: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ratings",
    },
  ],
  reviews: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "reviews",
    },
  ],
  createAt: {
    type: Date,
    default: Date.now(),
  },
});

// Reuse an already-registered model: Next.js re-evaluates modules on
// hot reload and across route bundles, and mongoose.model() throws
// OverwriteModelError if the same name is registered twice.
const User = mongoose.models.users || mongoose.model("users", userSchema);
module.exports = User;
