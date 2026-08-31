"use client";

import { useEffect, useState } from "react";

/**
 * Renders children only after mount.
 *
 * The storefront was ported from a Create React App SPA, so components freely
 * read `localStorage` during render and call `useSearchParams()` outside a
 * Suspense boundary — both of which fail during Next's server prerender.
 * Gating on mount reproduces CRA's client-only rendering exactly.
 */
export default function ClientOnly({ children, fallback = null }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted ? children : fallback;
}
