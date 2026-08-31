"use client";

import React, { useMemo } from "react";
import { classNames } from "../../../utils/classNames";
import { statusMeta, TONE_BADGE } from "../../utils/dashboardMetrics";

const COLORS = {
  amber: "#f59e0b",
  emerald: "#10b981",
  sky: "#0ea5e9",
  brand: "#f97316",
  red: "#ef4444",
  zinc: "#a1a1aa",
};

export default function OrderStatusDonut({ items, total }) {
  const segments = useMemo(() => {
    if (!total) return [];
    let angle = -90;
    return items.map(({ label, value }) => {
      const meta = statusMeta(label);
      const pct = value / total;
      const sweep = pct * 360;
      const start = angle;
      angle += sweep;
      const r = 54;
      const cx = 64;
      const cy = 64;
      const rad = (deg) => (deg * Math.PI) / 180;
      const x1 = cx + r * Math.cos(rad(start));
      const y1 = cy + r * Math.sin(rad(start));
      const x2 = cx + r * Math.cos(rad(start + sweep));
      const y2 = cy + r * Math.sin(rad(start + sweep));
      const large = sweep > 180 ? 1 : 0;
      const d =
        sweep >= 359.9
          ? `M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx - 0.01} ${cy - r}`
          : `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`;
      return { label, value, meta, pct, d, color: COLORS[meta.tone] || COLORS.zinc };
    });
  }, [items, total]);

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative shrink-0">
        <svg viewBox="0 0 128 128" className="h-36 w-36">
          {segments.map((s) => (
            <path key={s.label} d={s.d} fill={s.color} opacity={0.92}>
              <title>{`${s.meta.label}: ${s.value}`}</title>
            </path>
          ))}
          <circle cx="64" cy="64" r="34" fill="#fff" />
          <text x="64" y="60" textAnchor="middle" fill="#18181b" fontSize="18" fontWeight="600">
            {total}
          </text>
          <text x="64" y="76" textAnchor="middle" fill="#a1a1aa" fontSize="10">
            orders
          </text>
        </svg>
      </div>

      <ul className="w-full min-w-0 space-y-3 sm:max-w-[14rem]">
        {segments.map((s) => (
          <li key={s.label} className="flex items-center justify-between gap-3 text-sm">
            <span className="flex min-w-0 items-center gap-2">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: s.color }} />
              <span className="truncate font-medium text-foreground">{s.meta.label}</span>
            </span>
            <span
              className={classNames(
                "shrink-0 rounded-md px-2 py-0.5 text-xs font-medium tabular-nums ring-1 ring-inset",
                TONE_BADGE[s.meta.tone]
              )}
            >
              {Math.round(s.pct * 100)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
