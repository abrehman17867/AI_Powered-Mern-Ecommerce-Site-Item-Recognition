// Ported from backend/src/routes/payment.routes.js — logic unchanged.
import { createHandler } from "@/lib/expressAdapter";
import authenticate from "@/server/middleware/authenticate";
import Order from "@/server/models/order.model";
import cartService from "@/server/services/cart.service";
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
      await order.save();
      await cartService.clearUserCart(req.user._id);
    }

    return res.status(200).json({
      ok: true,
      paymentStatus: session.payment_status,
      orderId: order._id,
    });
  } catch (error) {
    console.error("Error confirming payment session:", error);
    return res.status(500).json({ error: "Could not confirm payment." });
  }
}

export const POST = createHandler(authenticate, confirmSession);
