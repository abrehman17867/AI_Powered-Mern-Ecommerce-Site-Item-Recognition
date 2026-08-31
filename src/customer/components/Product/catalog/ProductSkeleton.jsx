"use client";

import React from "react";

export function ProductSkeleton({ count = 8, view = "grid" }) {
  const items = Array.from({ length: count });
  if (view === "list") {
    return (
      <ul className="space-y-4" aria-hidden="true">
        {items.map((_, i) => (
          <li
            key={i}
            className="flex animate-pulse gap-4 rounded-2xl border border-line bg-white p-4 shadow-sm"
          >
            <div className="h-32 w-32 shrink-0 rounded-xl bg-zinc-200" />
            <div className="flex flex-1 flex-col gap-3 py-2">
              <div className="h-3 w-24 rounded bg-zinc-200" />
              <div className="h-4 w-3/4 max-w-md rounded bg-zinc-200" />
              <div className="h-4 w-32 rounded bg-zinc-200" />
            </div>
          </li>
        ))}
      </ul>
    );
  }
  return (
    <div
      className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 lg:gap-5"
      aria-hidden="true"
    >
      {items.map((_, i) => (
        <div
          key={i}
          className="animate-pulse overflow-hidden rounded-2xl border border-line bg-white shadow-sm"
        >
          <div className="aspect-[4/5] bg-zinc-200" />
          <div className="space-y-2 p-4">
            <div className="h-3 w-16 rounded bg-zinc-200" />
            <div className="h-4 w-full rounded bg-zinc-200" />
            <div className="h-4 w-20 rounded bg-zinc-200" />
          </div>
        </div>
      ))}
    </div>
  );
}
