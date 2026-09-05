"use client";

import React from "react";
import { classNames } from "../../utils/classNames";

/**
 * Shared shimmer primitives.
 *
 * Every list/table/detail view in the app should render a skeleton that matches
 * the shape of the content it is about to show, instead of swapping the whole
 * region for a spinner or a "Loading…" string. Keeping them here means the grey
 * tone, radius and pulse timing stay identical across storefront and admin.
 */
export function Skeleton({ className, rounded = "rounded-md" }) {
  // Two background utilities have equal specificity, so a caller's `bg-*` does
  // not reliably beat the default — the one Tailwind emits later wins, not the
  // one written last in the class string. Drop the default when the caller
  // supplies their own, which is how the dark hero placeholders stay subtle.
  const hasOwnBackground = /(^|\s)bg-/.test(className || "");
  return (
    <span
      aria-hidden="true"
      className={classNames(
        "block animate-pulse",
        !hasOwnBackground && "bg-zinc-200/80",
        rounded,
        className
      )}
    />
  );
}

/** A stack of text-height bars; the last one is short so it reads as a paragraph. */
export function SkeletonText({ lines = 3, className }) {
  return (
    <div className={classNames("space-y-2", className)} aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={classNames("h-3.5", i === lines - 1 ? "w-2/3" : "w-full")}
        />
      ))}
    </div>
  );
}

/**
 * Placeholder rows sized to a real table body, so the header, column widths and
 * card height stay put while the first page loads.
 */
export function TableSkeleton({ rows = 6, columns = 5, className }) {
  return (
    <tbody className={classNames("divide-y divide-line bg-surface", className)} aria-hidden="true">
      {Array.from({ length: rows }).map((_, r) => (
        <tr key={r}>
          {Array.from({ length: columns }).map((_, c) => (
            <td key={c} className="px-3 py-4">
              <Skeleton className={classNames("h-3.5", c === 0 ? "w-6" : "w-full max-w-[10rem]")} />
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );
}

/** Card-shaped placeholders for grid/list regions that are not tables. */
export function SkeletonCards({ count = 4, className, cardClassName }) {
  return (
    <div className={classNames("grid gap-4 sm:grid-cols-2 lg:grid-cols-4", className)} aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={classNames("rounded-2xl border border-line bg-surface p-5 shadow-sm", cardClassName)}
        >
          <Skeleton className="h-3 w-24" />
          <Skeleton className="mt-3 h-7 w-16" />
        </div>
      ))}
    </div>
  );
}

export default Skeleton;
