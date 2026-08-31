"use client";

import React from "react";
import { classNames } from "../../../utils/classNames";

export default function AdminCard({
  title,
  subtitle,
  action,
  children,
  className,
  bodyClassName,
  noPadding = false,
}) {
  return (
    <section className={classNames("admin-surface overflow-hidden", className)}>
      {(title || subtitle || action) && (
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line/60 px-5 py-4 sm:px-6">
          <div>
            {title ? <h2 className="text-sm font-semibold text-foreground">{title}</h2> : null}
            {subtitle ? (
              <p className="mt-0.5 text-xs text-foreground-muted">{subtitle}</p>
            ) : null}
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </div>
      )}
      <div className={classNames(!noPadding && "p-5 sm:p-6", bodyClassName)}>{children}</div>
    </section>
  );
}
