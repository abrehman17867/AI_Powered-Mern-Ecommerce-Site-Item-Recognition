"use client";

import React from "react";
import { classNames } from "../../utils/classNames";

/**
 * Thin indeterminate bar for a *background* refresh — a refetch after an edit,
 * delete or filter change where the previous data is still on screen and valid.
 *
 * The rule this enforces across the app: only the first load may replace
 * content with a skeleton. Every later fetch keeps the stale rows visible and
 * shows this bar instead, so a status change never blanks the table.
 */
export default function InlineLoadingBar({ active, className, label = "Refreshing" }) {
  return (
    <div
      className={classNames(
        "h-0.5 overflow-hidden bg-transparent transition-opacity duration-200",
        active ? "opacity-100" : "opacity-0",
        className
      )}
      role="status"
      aria-hidden={!active}
      aria-label={active ? label : undefined}
    >
      <div className="h-full w-1/3 animate-loading-slide rounded-full bg-brand-500" />
    </div>
  );
}
