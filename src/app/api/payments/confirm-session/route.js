// Ported from backend/src/routes/payment.routes.js — logic unchanged.
import { createHandler } from "@/lib/expressAdapter";
import authenticate from "@/server/middleware/authenticate";
import Order from "@/server/models/order.model";
import cartService from "@/server/services/cart.service";
import orderService from "@/server/services/order.service";
import Stripe from "stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function confirmSession(req, res) {
  const { sessionId, orderId } = req.body;

  if (!sessionId || !orderId) {
    return res.status(400).json({ error: "sessionId and orderId are required." });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const order = await Order.findById(orderId);

    if (!order || String(order.user) !== String(req.user._id)) {
      return res.status(404).json({ error: "Order not found." });
    }

    if (session.payment_status === "paid") {
      order.paymentDetails = order.paymentDetails || {};
      order.paymentDetails.paymentSatus = "PAID";
      order.paymentDetails.paymentMethod = "STRIPE";
      order.paymentDetails.transactionId = session.payment_intent || session.id;
      order.orderStatus = "CONFIRMED";
      // Orders placed before tracking existed get a reference here, so the
      // success screen always has one to show.
      await orderService.ensureTrackingNumber(order);
      orderService.appendStatus(order, "PAID", "Payment received");
      orderService.appendStatus(order, "CONFIRMED", "Order confirmed");
      await order.save();
      await cartService.clearUserCart(req.user._id);
    }

    return res.status(200).json({
      ok: true,
      paymentStatus: session.payment_status,
      orderId: order._id,
      trackingNumber: order.trackingNumber || null,
      orderStatus: order.orderStatus,
    });
  } catch (error) {
    console.error("Error confirming payment session:", error);
    return res.status(500).json({ error: "Could not confirm payment." });
  }
}

export const POST = createHandler(authenticate, confirmSession);
