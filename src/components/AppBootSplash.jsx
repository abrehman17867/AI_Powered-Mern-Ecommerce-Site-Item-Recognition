import React from "react";

/**
 * Server-rendered placeholder shown until the client bundle mounts.
 *
 * The whole app sits behind <ClientOnly> (see providers.jsx), so before
 * hydration the document body was completely empty — every hard load and
 * refresh flashed a blank white page with no indication anything was
 * happening. This gives that gap a deliberate first paint.
 *
 * The spinner fades in after a short delay, so a fast hydration shows a calm
 * background rather than a spinner that blinks in and straight back out.
 */
export default function AppBootSplash() {
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center gap-4 bg-surface-muted px-6"
      role="status"
      aria-live="polite"
    >
      <div
        className="flex flex-col items-center gap-4 opacity-0"
        style={{ animation: "tw-boot-fade-in 300ms ease-out 350ms forwards" }}
      >
        <span
          aria-hidden="true"
          className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 via-orange-400 to-amber-300 text-lg font-black text-white shadow-lg shadow-orange-950/20"
        >
          E
        </span>
        <span
          aria-hidden="true"
          className="h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent"
        />
        <p className="text-sm text-foreground-muted">Loading…</p>
      </div>
    </div>
  );
}
