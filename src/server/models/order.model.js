const mongoose = require("mongoose");
const { Schema } = mongoose;

const orderSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
  },
  orderItems: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "orderItems",
  }],
  orderDate: {
    type: Date,
    required: true,
    default: Date.now(),
  },
  deliveryDate: {
    type: Date,
  },
  shippingAddress: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "addresses",
  },
  paymentDetails: {
    paymentMethod: {
      type: String,
    },
    transactionId: {
      type: String,
    },
    paymentId: {
      type: String,
    },
    paymentSatus: {
      type: String,
      default: "PENDING",
    },
  },
  totalPrice: {
    type: Number,
    required: true,
  },
  totalDiscountedPrice: {
    type: Number,
    required: true,
  },
  discounte: {
    type: Number,
    required: true,
  },
  orderStatus: {
    type: String,
    required: true,
    default: "PENDING",
  },
  // Human-quotable reference the shopper can use to look the order up.
  // `sparse` so the unique index ignores pre-existing orders that have none.
  trackingNumber: {
    type: String,
    unique: true,
    sparse: true,
    index: true,
  },
  // Append-only record of how the order moved. Gives the tracker real dates
  // rather than a bare "which step are we on" guess derived from the current
  // status alone.
  statusHistory: [
    {
      status: { type: String },
      at: { type: Date, default: Date.now },
      note: { type: String },
      _id: false,
    },
  ],
  totalItem: {
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
const Order = mongoose.models.orders || mongoose.model("orders", orderSchema);
module.exports = Order;
