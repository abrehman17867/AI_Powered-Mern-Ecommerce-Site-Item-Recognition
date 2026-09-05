// Look an order up by its tracking reference, without signing in.
//
// A tracking number is a bearer credential of sorts — anyone holding it can
// see this response — so it returns only what a courier's tracking page would:
// status, timeline and a rough delivery estimate. No address, no contact
// details, no name, no prices, no payment data. Anything sensitive stays
// behind the authenticated /api/orders/:id route.
import { connectDb } from "@/lib/db";
import Order from "@/server/models/order.model";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Enough to make guessing a valid reference impractical, while staying
// forgiving about how the shopper types it.
function normalize(code) {
  return String(code || "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
}

function formatted(code) {
  const raw = normalize(code);
  if (!raw.startsWith("EC") || raw.length !== 11) return null;
  const body = raw.slice(2);
  return `EC-${body.slice(0, 3)}-${body.slice(3, 6)}-${body.slice(6, 9)}`;
}

export async function GET(request) {
  const code = new URL(request.url).searchParams.get("code");
  const trackingNumber = formatted(code);

  if (!trackingNumber) {
    return Response.json(
      { error: "Enter a tracking number in the form EC-XXX-XXX-XXX." },
      { status: 400 }
    );
  }

  try {
    await connectDb();
    const order = await Order.findOne({ trackingNumber })
      .select("orderStatus statusHistory orderDate deliveryDate totalItem trackingNumber")
      .lean();

    if (!order) {
      // Same shape and status for "not found" either way, so this cannot be
      // used to probe which references exist.
      return Response.json({ error: "No order found with that tracking number." }, { status: 404 });
    }

    return Response.json({
      trackingNumber: order.trackingNumber,
      orderStatus: order.orderStatus,
      orderDate: order.orderDate,
      deliveryDate: order.deliveryDate || null,
      totalItem: order.totalItem,
      statusHistory: (order.statusHistory || []).map((h) => ({
        status: h.status,
        at: h.at,
        note: h.note,
      })),
    });
  } catch (error) {
    return Response.json({ error: "Could not look up that order." }, { status: 500 });
  }
}
