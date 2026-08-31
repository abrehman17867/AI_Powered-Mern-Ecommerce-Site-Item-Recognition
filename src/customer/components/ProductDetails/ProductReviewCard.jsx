"use client";

import React from "react";
import { CheckBadgeIcon } from "@heroicons/react/24/solid";
import StarRating from "../../../components/ui/StarRating";
import { classNames } from "../../../utils/classNames";

function initials(user) {
  const first = user?.firstName?.charAt(0) || "";
  const last = user?.lastName?.charAt(0) || "";
  return (first + last).toUpperCase() || "?";
}

function displayName(user) {
  if (user?.firstName && user?.lastName) {
    return `${user.firstName} ${user.lastName.charAt(0)}.`;
  }
  return "Customer";
}

export default function ProductReviewCard({ review, rating }) {
  const date = review?.createAt
    ? new Date(review.createAt).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "";

  return (
    <article className="flex h-full flex-col rounded-2xl border border-line/80 bg-surface p-5 shadow-sm transition hover:border-brand-200/60 hover:shadow-md">
      <div className="flex items-start gap-3">
        <div
          className={classNames(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
            "bg-gradient-to-br from-brand-500 to-amber-400 text-xs font-bold text-white"
          )}
          aria-hidden
        >
          {initials(review?.user)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold text-foreground">{displayName(review?.user)}</p>
            <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-600">
              <CheckBadgeIcon className="h-3.5 w-3.5" />
              Verified
            </span>
          </div>
          {date ? (
            <time className="text-xs text-foreground-muted" dateTime={review.createAt}>
              {date}
            </time>
          ) : null}
        </div>
      </div>

      {rating != null && rating > 0 ? (
        <StarRating value={Number(rating)} size="sm" className="mt-3" />
      ) : null}

      <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-foreground-muted">
        &ldquo;{review?.review}&rdquo;
      </blockquote>
    </article>
  );
}
