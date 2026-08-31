// Ported from backend/src/routes/payment.routes.js — logic unchanged.
import { createHandler } from "@/lib/expressAdapter";
import authenticate from "@/server/middleware/authenticate";
import Order from "@/server/models/order.model";
import Stripe from "stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function createCheckoutSession(req, res) {
  const { orderItems, orderId } = req.body;

  if (!orderId) {
    return res.status(400).json({ error: "Order ID is required." });
  }

  try {
    const order = await Order.findById(orderId);
    if (!order || String(order.user) !== String(req.user._id)) {
      return res.status(404).json({ error: "Order not found." });
    }

    const clientUrl =
      process.env.CLIENT_URL || `${req.protocol}://${req.get("host")}`;

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
              // Stripe rejects data: URIs, so only pass through real http(s) images.
              images: /^https?:\/\//.test(item.product?.imageUrl || "")
                ? [item.product.imageUrl]
                : [],
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
      success_url: `${clientUrl}/PaymentSuccessPage?session_id={CHECKOUT_SESSION_ID}&order_id=${orderId}`,
      cancel_url: `${clientUrl}/PaymentCancelPage?order_id=${orderId}`,
    });

    return res.status(200).json({ sessionId: session.id });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return res.status(500).json({ error: "Could not create checkout session" });
  }
}

export const POST = createHandler(authenticate, createCheckoutSession);
