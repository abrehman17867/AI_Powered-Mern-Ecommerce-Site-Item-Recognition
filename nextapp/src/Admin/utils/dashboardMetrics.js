export const money = (n) =>
  new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number(n) || 0);

export function lastNDaysBuckets(n = 14) {
  const out = [];
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(end);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    out.push({
      key,
      label: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      revenue: 0,
      count: 0,
    });
  }
  return out;
}

export function bucketOrders(orders, days = 14) {
  const buckets = lastNDaysBuckets(days);
  const set = new Set(buckets.map((b) => b.key));
  (orders || []).forEach((o) => {
    const raw = o.orderDate || o.createAt || o.createdAt;
    if (!raw) return;
    const key = new Date(raw).toISOString().slice(0, 10);
    if (!set.has(key)) return;
    const b = buckets.find((x) => x.key === key);
    if (b) {
      b.revenue += Number(o.totalDiscountedPrice ?? o.totalPrice) || 0;
      b.count += 1;
    }
  });
  return buckets;
}

export function periodTrend(buckets, days = 7) {
  const recent = buckets.slice(-days);
  const prior = buckets.slice(-days * 2, -days);
  const sum = (arr, key) => arr.reduce((s, b) => s + (Number(b[key]) || 0), 0);
  const cur = sum(recent, "revenue");
  const prev = sum(prior, "revenue");
  if (prev === 0) return cur > 0 ? 100 : 0;
  return Math.round(((cur - prev) / prev) * 100);
}

export const STATUS_META = {
  PENDING: { label: "Pending", tone: "amber", bar: "bg-amber-500" },
  PLACED: { label: "Placed", tone: "amber", bar: "bg-amber-500" },
  CONFIRMED: { label: "Confirmed", tone: "emerald", bar: "bg-emerald-500" },
  SHIPPED: { label: "Shipped", tone: "sky", bar: "bg-sky-500" },
  DELIVERED: { label: "Delivered", tone: "brand", bar: "bg-brand-500" },
  CANCELLED: { label: "Cancelled", tone: "red", bar: "bg-red-500" },
};

export function statusMeta(status) {
  const key = String(status || "PENDING").toUpperCase();
  return STATUS_META[key] || { label: key, tone: "zinc", bar: "bg-zinc-400" };
}

export const TONE_BADGE = {
  amber: "bg-amber-50 text-amber-800 ring-amber-200/80",
  emerald: "bg-emerald-50 text-emerald-800 ring-emerald-200/80",
  sky: "bg-sky-50 text-sky-800 ring-sky-200/80",
  brand: "bg-brand-50 text-brand-800 ring-brand-200/80",
  red: "bg-red-50 text-red-800 ring-red-200/80",
  zinc: "bg-surface-muted text-foreground-muted ring-line",
};
