import React, { useMemo } from "react";

export default function MiniSparkline({ data = [], color = "#f97316", height = 40 }) {
  const path = useMemo(() => {
    if (!data.length) return "";
    const w = 120;
    const h = height;
    const max = Math.max(...data, 1);
    const min = Math.min(...data, 0);
    const range = max - min || 1;
    const step = data.length > 1 ? w / (data.length - 1) : w;

    const pts = data.map((v, i) => {
      const x = i * step;
      const y = h - ((v - min) / range) * (h - 4) - 2;
      return `${x},${y}`;
    });
    return `M ${pts.join(" L ")}`;
  }, [data, height]);

  if (!data.length) return null;

  return (
    <svg viewBox={`0 0 120 ${height}`} className="h-10 w-full max-w-[7rem]" preserveAspectRatio="none" aria-hidden>
      <path d={path} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
