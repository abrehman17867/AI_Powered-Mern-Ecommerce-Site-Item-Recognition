"use client";

import React from "react";
import { classNames } from "../../../utils/classNames";
import "./Spinner.css";

const SIZES = {
  sm: "h-5 w-5 border-2",
  md: "h-8 w-8 border-[3px]",
  lg: "h-12 w-12 border-4",
};

/**
 * Brand loading indicator.
 *
 * Replaces the old lds-roller: eight 7px dots in a hard-coded purple, inside a
 * wrapper forced to `height: 100vh`. It read as a tiny off-brand speck that
 * pushed everything else off the screen. This is a single arc ring in the
 * brand colour that sizes to its container.
 */
export default function Spinner({ size = "md", className, label }) {
  return (
    <span className={classNames("app-spinner", className)} role="status">
      <span
        aria-hidden="true"
        className={classNames(
          "app-spinner-ring inline-block shrink-0 rounded-full border-brand-500/25 border-t-brand-500",
          SIZES[size] || SIZES.md
        )}
      />
      {label ? <span className="sr-only">{label}</span> : null}
    </span>
  );
}
