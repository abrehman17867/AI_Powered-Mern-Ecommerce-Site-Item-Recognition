"use client";

import { useCallback, useEffect, useState } from "react";

const KEY = "ecom_compare";
const MAX = 4;

function readList() {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function useCompare() {
  const [items, setItems] = useState(readList);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(items));
  }, [items]);

  const toggle = useCallback((product) => {
    if (!product?._id) return;
    setItems((prev) => {
      const exists = prev.some((p) => p._id === product._id);
      if (exists) return prev.filter((p) => p._id !== product._id);
      if (prev.length >= MAX) return prev;
      return [...prev, product];
    });
  }, []);

  const has = useCallback((id) => items.some((p) => p._id === id), [items]);

  const remove = useCallback((id) => {
    setItems((prev) => prev.filter((p) => p._id !== id));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  return { items, count: items.length, max: MAX, toggle, has, remove, clear };
}
