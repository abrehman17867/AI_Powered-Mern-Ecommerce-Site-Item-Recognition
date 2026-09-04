"use client";

/**
 * Tiny pub/sub so a navigation can announce itself the moment it starts.
 *
 * The App Router gives no "transition started" signal: `router.push` returns
 * immediately and `usePathname()` only changes once the next route has
 * committed. Between those two points — which is most of the wait, since the
 * new page still has to fetch its data — nothing on screen moved, so every
 * redirect looked like a dead click. The navigation shim calls `start()` on
 * push, and <RouteProgress /> calls `stop()` when the new path commits.
 */
const listeners = new Set();
let active = false;

function notify() {
  for (const fn of listeners) fn(active);
}

export function startRouteProgress() {
  if (active) return;
  active = true;
  notify();
}

export function stopRouteProgress() {
  if (!active) return;
  active = false;
  notify();
}

export function subscribeRouteProgress(fn) {
  listeners.add(fn);
  fn(active);
  return () => listeners.delete(fn);
}
