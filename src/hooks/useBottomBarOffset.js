"use client";

import { useEffect } from "react";

/**
 * Publishes the height of a screen's fixed bottom action bar as the
 * `--app-bottom-bar` custom property.
 *
 * Overlays anchored to the bottom of the viewport — the toast container, in
 * particular — read this so they sit above the bar instead of underneath it.
 * The property is removed on unmount so it never leaks to a screen without a
 * bar.
 */
export default function useBottomBarOffset(active, height = "4.75rem") {
  useEffect(() => {
    if (!active) return undefined;
    const root = document.documentElement;
    root.style.setProperty("--app-bottom-bar", height);
    return () => root.style.removeProperty("--app-bottom-bar");
  }, [active, height]);
}
