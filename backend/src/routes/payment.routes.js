require("dotenv").config();
const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const authenticate = require("../middleware/authenticate");
const Order = require("../models/order.model");
const cartService = require("../services/cart.service");

router.post("/create-checkout-session", authenticate, async (req, res) => {
  const { orderItems, orderId } = req.body;

  if (!orderId) {
    return res.status(400).json({ error: "Order ID is required." });
  }

  try {
    const order = await Order.findById(orderId);
    if (!order || String(order.user) !== String(req.user._id)) {
      return res.status(404).json({ error: "Order not found." });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: orderItems.map((item) => {
        const qty = Math.max(1, Number(item.quantity) || 1);
        const unitAmount =
          Number(item.product?.discountedPrice ?? item.discountedPrice) || 0;
        return {
          price_data: {
            currency: "usd",
            product_data: {
              name: item.product?.title || item.product?.brand || "Product",
              images: item.product?.imageUrl ? [item.product.imageUrl] : [],
            },
            unit_amount: Math.round(unitAmount * 100),
          },
          quantity: qty,
        };
      }),
      mode: "payment",
      metadata: {
        orderId: String(orderId),
        userId: String(req.user._id),
      },
      success_url: `${process.env.CLIENT_URL}/PaymentSuccessPage?session_id={CHECKOUT_SESSION_ID}&order_id=${orderId}`,
      cancel_url: `${process.env.CLIENT_URL}/PaymentCancelPage?order_id=${orderId}`,
    });

    res.status(200).json({ sessionId: session.id });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    res.status(500).json({ error: "Could not create checkout session" });
  }
});

router.post("/confirm-session", authenticate, async (req, res) => {
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

    res.status(200).json({
      ok: true,
      paymentStatus: session.payment_status,
      orderId: order._id,
    });
  } catch (error) {
    console.error("Error confirming payment session:", error);
    res.status(500).json({ error: "Could not confirm payment." });
  }
});

module.exports = router;
