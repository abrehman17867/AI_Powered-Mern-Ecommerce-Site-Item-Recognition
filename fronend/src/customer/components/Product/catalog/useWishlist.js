import { useCallback, useEffect, useState } from "react";

const KEY = "ecom_wishlist";

function readItems() {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    if (parsed.length > 0 && typeof parsed[0] === "string") {
      return [];
    }
    return parsed.filter((p) => p?._id);
  } catch {
    return [];
  }
}

export function useWishlist() {
  const [items, setItems] = useState(readItems);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(items));
  }, [items]);

  const toggle = useCallback((product) => {
    if (!product?._id) return;
    setItems((prev) => {
      const exists = prev.some((p) => p._id === product._id);
      if (exists) return prev.filter((p) => p._id !== product._id);
      return [...prev, product];
    });
  }, []);

  const remove = useCallback((productId) => {
    setItems((prev) => prev.filter((p) => p._id !== productId));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const has = useCallback(
    (productId) => items.some((p) => p._id === productId),
    [items]
  );

  return { items, ids: items.map((p) => p._id), count: items.length, toggle, has, remove, clear };
}
