"use client";

import React from "react";

export default function AdminPageHeader({ title, subtitle, action }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h2>
        {subtitle ? <p className="mt-1 text-sm text-foreground-muted">{subtitle}</p> : null}
      </div>
      {action ? <div className="flex shrink-0 flex-wrap gap-2">{action}</div> : null}
    </div>
  );
}
