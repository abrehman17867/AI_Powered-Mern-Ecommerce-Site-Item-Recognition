require("dotenv").config();
const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

router.post("/create-checkout-session", async (req, res) => {
  const { orderItems } = req.body;

  // console.log("Received order items:", orderItems);

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: orderItems.map((item) => ({
        price_data: {
          currency: "usd",
          product_data: {
            name: item.product.brand,
            images: [item.product.imageUrl],
          },
          unit_amount: item.discountedPrice * 100,
        },
        quantity: item.quantity,
      })),
      mode: "payment",
      success_url: `${process.env.CLIENT_URL}/PaymentSuccessPage`,
      cancel_url: `${process.env.CLIENT_URL}/PaymentCancelPage`,
    });

    res.status(200).json({ sessionId: session.id }); // Return sessionId to frontend
  } catch (error) {
    console.error("Error creating checkout session:", error);
    res.status(500).json({ error: "Could not create checkout session" });
  }
});

module.exports = router;
