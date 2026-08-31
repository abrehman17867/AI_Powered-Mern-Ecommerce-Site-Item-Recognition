"use client";

import React from "react";
import { classNames } from "../../../utils/classNames";

const ACCENTS = {
  brand: "from-brand-500/12 to-brand-600/5 border-brand-200/60",
  emerald: "from-emerald-500/12 to-emerald-600/5 border-emerald-200/60",
  amber: "from-amber-500/12 to-amber-600/5 border-amber-200/60",
  sky: "from-sky-500/12 to-sky-600/5 border-sky-200/60",
};

const AdminStatCard = ({ label, value, hint, accent = "brand" }) => {
  return (
    <div
      className={classNames(
        "relative overflow-hidden rounded-2xl border bg-gradient-to-br p-5 shadow-card",
        ACCENTS[accent] || ACCENTS.brand
      )}
    >
      <p className="text-xs font-semibold uppercase tracking-wider text-foreground-muted">{label}</p>
      <p className="mt-2 text-3xl font-bold tabular-nums tracking-tight text-foreground">{value}</p>
      {hint ? <p className="mt-1 text-xs text-foreground-subtle">{hint}</p> : null}
    </div>
  );
};

export default AdminStatCard;
