"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { classNames } from "../utils/classNames";
import { stopRouteProgress, subscribeRouteProgress } from "../lib/routeProgress";

// If a navigation is cancelled or a route never commits, the bar must not stay
// up forever.
const MAX_VISIBLE_MS = 12000;

/**
 * Thin top-of-viewport bar shown while a page transition is in flight, so a
 * redirect gives immediate feedback instead of appearing to do nothing until
 * the next screen suddenly replaces the current one.
 */
export default function RouteProgress() {
  const [active, setActive] = useState(false);
  const pathname = usePathname();

  useEffect(() => subscribeRouteProgress(setActive), []);

  // The new route has committed — the transition is over.
  useEffect(() => {
    stopRouteProgress();
  }, [pathname]);

  useEffect(() => {
    if (!active) return undefined;
    const timer = setTimeout(stopRouteProgress, MAX_VISIBLE_MS);
    return () => clearTimeout(timer);
  }, [active]);

  return (
    <div
      aria-hidden={!active}
      role="status"
      aria-label={active ? "Loading page" : undefined}
      className={classNames(
        // Above the navbar (z-50) and both drawers (z-[60]/z-[70]) so it stays
        // visible whatever is open when the navigation starts.
        "pointer-events-none fixed inset-x-0 top-0 z-[200] h-0.5 overflow-hidden transition-opacity duration-200",
        active ? "opacity-100" : "opacity-0"
      )}
    >
      <div className="h-full w-1/3 animate-loading-slide rounded-full bg-brand-500" />
    </div>
  );
}
