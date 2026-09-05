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
  // Not required: an account created through Google has no local password.
  // Password login checks for its absence and says so rather than throwing.
  password: {
    type: String,
  },
  email: {
    type: String,
    required: true,
  },
  // Google's stable subject id. `sparse` so the unique index only covers
  // documents that actually have one.
  googleId: {
    type: String,
    unique: true,
    sparse: true,
  },
  avatar: {
    type: String,
  },
  authProvider: {
    type: String,
    enum: ["local", "google"],
    default: "local",
  },
  // role: {
  //   type: String,
  //   required: true,
  //   default: "CUSTOMER",
  // },
  // The role currently in effect. For a user holding several roles this is
  // whichever one they last switched to; every authorisation check reads it.
  role: {
    type: String,
    enum: ["CUSTOMER", "ADMIN"],
    default: "CUSTOMER",
  },
  // Every role the user is entitled to. A user with more than one gets a role
  // switcher in the account menu. Legacy documents have no roles array, so
  // read it through normalizeRoles() in user.service rather than directly.
  roles: {
    type: [String],
    enum: ["CUSTOMER", "ADMIN"],
    default: ["CUSTOMER"],
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
