"use client";

import React from "react";
import { StarIcon } from "@heroicons/react/24/solid";
import { classNames } from "../../utils/classNames";

export default function StarRating({
  value = 0,
  max = 5,
  size = "md",
  showValue = false,
  className,
}) {
  const rounded = Math.min(max, Math.max(0, Math.round(value * 2) / 2));
  const sizeClass =
    size === "sm" ? "h-4 w-4" : size === "lg" ? "h-6 w-6" : "h-5 w-5";

  return (
    <div className={classNames("flex items-center gap-2", className)}>
      <div className="flex items-center" aria-hidden>
        {Array.from({ length: max }, (_, i) => (
          <StarIcon
            key={i}
            className={classNames(
              sizeClass,
              i + 1 <= rounded ? "text-amber-400" : "text-zinc-200"
            )}
          />
        ))}
      </div>
      {showValue ? (
        <span className="text-sm font-medium text-foreground-muted">
          {value > 0 ? value.toFixed(1) : "—"}
        </span>
      ) : null}
    </div>
  );
}
