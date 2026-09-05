/**
 * Gives orders placed before tracking existed a reference and a plausible
 * history, so the orders page and /track work for them too.
 *
 * Additive only: orders that already have a trackingNumber or statusHistory
 * are left untouched, and nothing is deleted or overwritten.
 *
 * Dry run (default):  node scripts/backfillOrderTracking.js
 * Apply:              node scripts/backfillOrderTracking.js --apply
 */
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env.local") });
const mongoose = require("mongoose");
const Order = require("../src/server/models/order.model");
const orderService = require("../src/server/services/order.service");

const APPLY = process.argv.includes("--apply");

// The steps an order must have passed through to be in its current state.
const IMPLIED_HISTORY = {
  PENDING: ["PENDING"],
  PLACED: ["PENDING"],
  CONFIRMED: ["PENDING", "CONFIRMED"],
  SHIPPED: ["PENDING", "CONFIRMED", "SHIPPED"],
  DELIVERED: ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED"],
  CANCELLED: ["PENDING", "CANCELLED"],
};

const NOTE = {
  PENDING: "Order placed",
  CONFIRMED: "Order confirmed",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Order cancelled",
};

async function run() {
  await mongoose.connect(process.env.MONGODB_URL, { serverSelectionTimeoutMS: 20000 });

  const orders = await Order.find({
    $or: [
      { trackingNumber: { $exists: false } },
      { trackingNumber: null },
      { statusHistory: { $size: 0 } },
      { statusHistory: { $exists: false } },
    ],
  });

  console.log(`${orders.length} order(s) need backfilling`);

  const planned = [];
  for (const order of orders) {
    const status = String(order.orderStatus || "PENDING").toUpperCase();
    const steps = IMPLIED_HISTORY[status] || IMPLIED_HISTORY.PENDING;
    const placedAt = order.orderDate || order.createAt || new Date();

    const needsTracking = !order.trackingNumber;
    const needsHistory = !(order.statusHistory || []).length;

    const tracking = needsTracking ? await orderService.generateTrackingNumber() : order.trackingNumber;

    planned.push({ order, tracking, steps, placedAt, needsTracking, needsHistory });
    console.log(
      `  ${String(order._id)}  ${status.padEnd(10)} -> ${tracking}` +
        `${needsHistory ? `  history: ${steps.join(" > ")}` : "  (history kept)"}`
    );
  }

  if (!APPLY) {
    console.log("\nDRY RUN — nothing written. Re-run with --apply to commit.");
  } else {
    let n = 0;
    for (const p of planned) {
      if (p.needsTracking) p.order.trackingNumber = p.tracking;
      if (p.needsHistory) {
        // Spread the implied steps across the time the order has existed, so
        // the timeline reads plausibly rather than stamping everything now.
        const start = new Date(p.placedAt).getTime();
        const span = Math.max(0, Date.now() - start);
        p.order.statusHistory = p.steps.map((status, i) => ({
          status,
          at: new Date(start + (span * i) / Math.max(1, p.steps.length - 1 || 1)),
          note: NOTE[status] || status,
        }));
      }
      await p.order.save();
      n += 1;
    }
    console.log(`\nAPPLIED — updated ${n} order(s).`);
  }

  await mongoose.disconnect();
}

if (require.main === module) {
  run().catch((e) => {
    console.error("Backfill failed:", e.message);
    process.exit(1);
  });
}

module.exports = { run };
