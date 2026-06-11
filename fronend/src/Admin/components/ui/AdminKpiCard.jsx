import React from "react";
import { classNames } from "../../../utils/classNames";
import { ArrowDownIcon, ArrowUpIcon } from "@heroicons/react/20/solid";
import MiniSparkline from "../charts/MiniSparkline";

const ACCENTS = {
  brand: {
    icon: "bg-brand-500/10 text-brand-600",
    glow: "from-brand-500/20",
    spark: "#f97316",
  },
  emerald: {
    icon: "bg-emerald-500/10 text-emerald-600",
    glow: "from-emerald-500/20",
    spark: "#10b981",
  },
  violet: {
    icon: "bg-violet-500/10 text-violet-600",
    glow: "from-violet-500/20",
    spark: "#8b5cf6",
  },
  sky: {
    icon: "bg-sky-500/10 text-sky-600",
    glow: "from-sky-500/20",
    spark: "#0ea5e9",
  },
};

export default function AdminKpiCard({
  label,
  value,
  sub,
  icon: Icon,
  trend,
  sparkData,
  accent = "brand",
  loading = false,
}) {
  const up = typeof trend === "number" && trend >= 0;
  const theme = ACCENTS[accent] || ACCENTS.brand;

  return (
    <div className="admin-stat relative overflow-hidden">
      <div
        className={classNames(
          "pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-gradient-to-br to-transparent opacity-60 blur-2xl",
          theme.glow
        )}
      />
      <div className="relative flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground-muted">{label}</p>
            <p className="mt-2 text-3xl font-bold tracking-tight text-foreground">
              {loading ? (
                <span className="inline-block h-9 w-28 animate-pulse rounded-lg bg-zinc-100" />
              ) : (
                value
              )}
            </p>
          </div>
          {Icon ? (
            <div
              className={classNames(
                "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
                theme.icon
              )}
            >
              <Icon className="h-5 w-5" strokeWidth={1.75} />
            </div>
          ) : null}
        </div>

        {sparkData?.length && !loading ? (
          <MiniSparkline data={sparkData} color={theme.spark} />
        ) : loading ? (
          <div className="h-10 animate-pulse rounded-lg bg-zinc-100" />
        ) : null}

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          {sub && !loading ? <p className="text-xs text-foreground-muted">{sub}</p> : null}
          {typeof trend === "number" && !loading ? (
            <p
              className={classNames(
                "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold",
                up ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"
              )}
            >
              {up ? <ArrowUpIcon className="h-3.5 w-3.5" /> : <ArrowDownIcon className="h-3.5 w-3.5" />}
              {Math.abs(trend)}%
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
