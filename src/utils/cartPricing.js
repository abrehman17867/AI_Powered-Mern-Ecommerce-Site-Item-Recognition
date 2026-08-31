/** Cart/order line math — prices in DB are per-unit; always multiply by quantity for line totals. */

export function unitPrice(item) {
  const fromProduct = Number(item?.product?.price);
  if (fromProduct > 0) return fromProduct;
  const qty = Math.max(1, Number(item?.quantity) || 1);
  const stored = Number(item?.price) || 0;
  return stored > 0 && qty > 1 && stored > fromProduct * 1.5 ? stored / qty : stored;
}

export function unitDiscountedPrice(item) {
  const fromProduct = Number(item?.product?.discountedPrice);
  if (fromProduct > 0) return fromProduct;
  const qty = Math.max(1, Number(item?.quantity) || 1);
  const stored = Number(item?.discountedPrice) || 0;
  return stored > 0 && qty > 1 ? stored / qty : stored;
}

export function lineTotal(item) {
  const qty = Math.max(1, Number(item?.quantity) || 1);
  return unitDiscountedPrice(item) * qty;
}
