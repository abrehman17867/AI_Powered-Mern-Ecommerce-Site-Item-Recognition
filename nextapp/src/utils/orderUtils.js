export const formatMoney = (value) =>
  new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);

export const formatOrderDate = (date) => {
  if (!date) return "—";
  return new Date(date).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export const shortOrderId = (id) =>
  id ? `#${String(id).slice(-8).toUpperCase()}` : "#—";

export const ORDER_STATUS = {
  PENDING: {
    label: "Processing",
    description: "We're preparing your order",
    tone: "amber",
  },
  CONFIRMED: {
    label: "Confirmed",
    description: "Order confirmed — packing soon",
    tone: "brand",
  },
  SHIPPED: {
    label: "Shipped",
    description: "On the way to you",
    tone: "sky",
  },
  DELIVERED: {
    label: "Delivered",
    description: "Package delivered",
    tone: "emerald",
  },
  CANCELLED: {
    label: "Cancelled",
    description: "This order was cancelled",
    tone: "red",
  },
};

export const PAYMENT_STATUS = {
  PENDING: { label: "Payment pending", tone: "amber" },
  PAID: { label: "Paid", tone: "emerald" },
};

export const STATUS_FILTERS = [
  { label: "All orders", value: "all" },
  { label: "Processing", value: "PENDING" },
  { label: "Confirmed", value: "CONFIRMED" },
  { label: "Shipped", value: "SHIPPED" },
  { label: "Delivered", value: "DELIVERED" },
  { label: "Cancelled", value: "CANCELLED" },
];

export const TRACKER_STEPS = [
  { key: "placed", label: "Placed" },
  { key: "confirmed", label: "Confirmed" },
  { key: "shipped", label: "Shipped" },
  { key: "out", label: "Out for delivery" },
  { key: "delivered", label: "Delivered" },
];

export function getOrderStatusMeta(status) {
  const key = String(status || "PENDING").toUpperCase();
  return ORDER_STATUS[key] || ORDER_STATUS.PENDING;
}

export function getPaymentMeta(paymentStatus) {
  const key = String(paymentStatus || "PENDING").toUpperCase();
  return PAYMENT_STATUS[key] || PAYMENT_STATUS.PENDING;
}

export function getTrackerStep(order) {
  const status = String(order?.orderStatus || "PENDING").toUpperCase();
  const paid = order?.paymentDetails?.paymentSatus === "PAID";

  if (status === "CANCELLED") return -1;
  if (status === "DELIVERED") return 4;
  if (status === "SHIPPED") return 3;
  if (status === "CONFIRMED") return 1;
  if (paid) return 1;
  return 0;
}

export function estimatedDeliveryDate(order) {
  if (order?.deliveryDate) return new Date(order.deliveryDate);
  const base = order?.orderDate ? new Date(order.orderDate) : new Date();
  const eta = new Date(base);
  eta.setDate(eta.getDate() + 7);
  return eta;
}

export const toneClasses = {
  amber: "bg-amber-50 text-amber-800 ring-amber-200/80",
  brand: "bg-brand-50 text-brand-800 ring-brand-200/80",
  sky: "bg-sky-50 text-sky-800 ring-sky-200/80",
  emerald: "bg-emerald-50 text-emerald-800 ring-emerald-200/80",
  red: "bg-red-50 text-red-800 ring-red-200/80",
};
