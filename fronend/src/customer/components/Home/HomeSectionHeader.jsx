import React from "react";
import { Link } from "react-router-dom";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { classNames } from "../../../utils/classNames";

export default function HomeSectionHeader({
  eyebrow,
  title,
  description,
  href,
  linkLabel = "View all",
  align = "left",
  className,
}) {
  return (
    <div
      className={classNames(
        "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
        align === "center" && "text-center sm:flex-col sm:items-center",
        className
      )}
    >
      <div className={classNames("max-w-2xl", align === "center" && "mx-auto")}>
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="mt-1 font-display text-2xl font-bold tracking-tight text-zinc-900 md:text-3xl">
          {title}
        </h2>
        {description ? (
          <p className="mt-2 text-sm leading-relaxed text-zinc-600 md:text-base">
            {description}
          </p>
        ) : null}
      </div>
      {href ? (
        <Link
          to={href}
          className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-zinc-900 transition hover:text-brand-600"
        >
          {linkLabel}
          <ArrowRightIcon className="h-4 w-4" aria-hidden />
        </Link>
      ) : null}
    </div>
  );
}
