"use client";

import { useMemo } from "react";
import { useSelector } from "react-redux";

/** Total item quantity in cart — single source of truth for badges across the app. */
export function useCartCount() {
  const cart = useSelector((store) => store.cart?.cart);

  return useMemo(() => {
    const items = cart?.cartItems;
    if (Array.isArray(items) && items.length > 0) {
      return items.reduce((sum, item) => {
        const q = Number(item?.quantity);
        return sum + (Number.isFinite(q) && q > 0 ? q : 1);
      }, 0);
    }
    const total = Number(cart?.totalItem);
    return Number.isFinite(total) && total > 0 ? total : 0;
  }, [cart?.cartItems, cart?.totalItem]);
}
