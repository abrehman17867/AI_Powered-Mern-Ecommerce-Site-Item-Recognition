import React from "react";
import { classNames } from "../../utils/classNames";

/** Modern form chrome for login / register (page + modal) */
export default function AuthFormPanel({
  eyebrow,
  title,
  subtitle,
  children,
  footer,
  compact = false,
  error,
}) {
  return (
    <div className={classNames(compact ? "w-full" : "w-full")}>
      <div className={classNames(!compact && "mb-8")}>
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">{eyebrow}</p>
        ) : null}
        <h2
          className={classNames(
            "font-bold tracking-tight text-foreground",
            compact ? "text-xl" : "mt-2 text-2xl sm:text-3xl"
          )}
        >
          {title}
        </h2>
        {subtitle ? (
          <p className={classNames("text-foreground-muted", compact ? "mt-1 text-sm" : "mt-2 text-sm sm:text-base")}>
            {subtitle}
          </p>
        ) : null}
      </div>

      {error ? (
        <div
          className="mb-5 rounded-xl border border-red-200/80 bg-red-50 px-4 py-3 text-sm text-red-800"
          role="alert"
        >
          <p className="font-semibold">Unable to continue</p>
          <p className="mt-1 text-red-700">{error}</p>
        </div>
      ) : null}

      <div
        className={classNames(
          compact ? "space-y-0" : "rounded-2xl border border-line/80 bg-surface p-6 shadow-card sm:p-8"
        )}
      >
        {children}
      </div>

      {footer ? <div className="mt-6 text-center">{footer}</div> : null}
    </div>
  );
}
