import React from "react";
import { classNames } from "../../utils/classNames";

const tones = {
  default: "bg-zinc-100 text-zinc-700 ring-zinc-200",
  brand: "bg-brand-50 text-brand-700 ring-brand-200",
  success: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  warning: "bg-amber-50 text-amber-800 ring-amber-200",
  danger: "bg-red-50 text-red-700 ring-red-200",
  accent: "bg-accent-50 text-accent-800 ring-accent-200",
};

const Badge = ({ children, tone = "default", className }) => (
  <span
    className={classNames(
      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset",
      tones[tone],
      className
    )}
  >
    {children}
  </span>
);

export default Badge;
