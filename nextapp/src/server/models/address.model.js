const mongoose = require("mongoose");

const AddressSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  streetAddress: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  zipCode: {
    type: Number,
    required: true,
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "users",
  },
  mobile: {
    type: String,
    required: true,
  },
});

// Reuse an already-registered model: Next.js re-evaluates modules on
// hot reload and across route bundles, and mongoose.model() throws
// OverwriteModelError if the same name is registered twice.
const Address = mongoose.models.addresses || mongoose.model("addresses", AddressSchema);
module.exports = Address;
