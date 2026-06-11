import React, { useMemo } from "react";
import { money } from "../../utils/dashboardMetrics";

const W = 640;
const H = 200;
const PAD = { top: 16, right: 12, bottom: 28, left: 48 };

export default function SalesAreaChart({ points }) {
  const chart = useMemo(() => {
    const values = points.map((p) => p.revenue);
    const max = Math.max(...values, 1);
    const innerW = W - PAD.left - PAD.right;
    const innerH = H - PAD.top - PAD.bottom;
    const step = points.length > 1 ? innerW / (points.length - 1) : innerW;

    const coords = points.map((p, i) => {
      const x = PAD.left + i * step;
      const y = PAD.top + innerH - (p.revenue / max) * innerH;
      return { x, y, ...p };
    });

    const line = coords.map((c, i) => `${i === 0 ? "M" : "L"} ${c.x} ${c.y}`).join(" ");
    const area = `${line} L ${coords[coords.length - 1].x} ${PAD.top + innerH} L ${coords[0].x} ${PAD.top + innerH} Z`;

    const yTicks = [0, 0.5, 1].map((t) => ({
      y: PAD.top + innerH - t * innerH,
      label: money(max * t),
    }));

    const xLabels = coords.filter((_, i) => i % 2 === 0 || i === coords.length - 1);

    return { coords, line, area, yTicks, xLabels, max };
  }, [points]);

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-[220px] w-full" role="img" aria-label="Sales chart">
        <defs>
          <linearGradient id="salesAreaFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f97316" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#f97316" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {chart.yTicks.map((t) => (
          <g key={t.label}>
            <line
              x1={PAD.left}
              y1={t.y}
              x2={W - PAD.right}
              y2={t.y}
              stroke="#e4e4e7"
              strokeDasharray="4 4"
            />
            <text x={PAD.left - 8} y={t.y + 4} textAnchor="end" fill="#a1a1aa" fontSize="10">
              {t.label}
            </text>
          </g>
        ))}

        <path d={chart.area} fill="url(#salesAreaFill)" />
        <path d={chart.line} fill="none" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

        {chart.coords.map((c) =>
          c.revenue > 0 ? (
            <circle key={c.key} cx={c.x} cy={c.y} r="4" fill="#fff" stroke="#f97316" strokeWidth="2">
              <title>{`${c.label}: ${money(c.revenue)}`}</title>
            </circle>
          ) : null
        )}

        {chart.xLabels.map((c) => (
          <text key={`x-${c.key}`} x={c.x} y={H - 6} textAnchor="middle" fill="#a1a1aa" fontSize="10">
            {c.label.split(" ")[1] || c.label}
          </text>
        ))}
      </svg>
    </div>
  );
}
