"use client";

import React from "react";
import { classNames } from "../../../utils/classNames";

/**
 * Cart quantity pill — use on icon buttons site-wide.
 * @param {"light" | "dark"} surface — navbar background context for ring contrast
 */
export default function CartBadge({ count, surface = "light", className }) {
  if (!count || count <= 0) return null;

  const display = count > 99 ? "99+" : count;

  return (
    <span
      className={classNames(
        "pointer-events-none absolute -right-1.5 -top-1.5 z-10",
        "flex h-5 min-w-[1.25rem] items-center justify-center rounded-full px-1",
        "bg-gradient-to-br from-orange-500 to-orange-600",
        "text-[10px] font-bold leading-none text-white",
        "shadow-[0_2px_8px_rgba(249,115,22,0.45)]",
        "ring-2 tabular-nums",
        surface === "dark" ? "ring-zinc-950/80" : "ring-white",
        className
      )}
      aria-hidden
    >
      {display}
    </span>
  );
}
