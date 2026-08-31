"use client";

import React, { useMemo, useState } from "react";
import { ChatBubbleLeftRightIcon, PencilSquareIcon } from "@heroicons/react/24/outline";
import StarRating from "../../../components/ui/StarRating";
import EmptyState from "../../../components/ui/EmptyState";
import ProductReviewCard from "./ProductReviewCard";
import RatingsReviewForm from "../../pages/Ratings and Reviews/RatingsReviewForm";
import { classNames } from "../../../utils/classNames";

const STAR_LEVELS = [5, 4, 3, 2, 1];

function buildBreakdown(ratingList) {
  const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  (ratingList || []).forEach((r) => {
    const star = Math.min(5, Math.max(1, Math.round(Number(r.rating) || 0)));
    counts[star] += 1;
  });
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  return STAR_LEVELS.map((star) => ({
    star,
    count: counts[star],
    percent: total > 0 ? Math.round((counts[star] / total) * 100) : 0,
  }));
}

export default function ProductReviewsSection({
  productId,
  reviewList,
  ratingList,
  totalRating,
  findRating,
}) {
  const [tab, setTab] = useState("reviews");

  const reviewCount = reviewList?.length ?? 0;
  const ratingValue = Number(totalRating) || 0;
  const breakdown = useMemo(() => buildBreakdown(ratingList), [ratingList]);

  const tabs = [
    { id: "reviews", label: `Reviews (${reviewCount})`, icon: ChatBubbleLeftRightIcon },
    { id: "write", label: "Write a review", icon: PencilSquareIcon },
  ];

  return (
    <section className="mt-16 border-t border-line pt-12" id="reviews">
      <div className="overflow-hidden rounded-2xl border border-line bg-gradient-to-br from-surface via-surface to-brand-50/30 shadow-sm">
        <div className="grid gap-8 border-b border-line p-6 sm:p-8 lg:grid-cols-[280px_1fr] lg:gap-12">
          <div className="text-center lg:text-left">
            <p className="text-5xl font-bold tracking-tight text-foreground">
              {ratingValue > 0 ? ratingValue.toFixed(1) : "—"}
            </p>
            <StarRating
              value={ratingValue}
              size="lg"
              className="mt-3 justify-center lg:justify-start"
            />
            <p className="mt-2 text-sm text-foreground-muted">
              {reviewCount > 0
                ? `${reviewCount} verified review${reviewCount !== 1 ? "s" : ""}`
                : "No reviews yet"}
            </p>
            {ratingValue >= 4 && reviewCount > 0 && (
              <span className="mt-4 inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                Customers love this
              </span>
            )}
          </div>

          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-foreground-muted">
              Rating breakdown
            </p>
            {breakdown.map(({ star, count, percent }) => (
              <div key={star} className="flex items-center gap-3">
                <span className="w-10 text-sm font-medium text-foreground-muted">
                  {star} ★
                </span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-zinc-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-600 transition-all duration-500"
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <span className="w-8 text-right text-xs text-foreground-muted">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="border-b border-line px-4 sm:px-8">
          <div className="flex gap-1" role="tablist">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={tab === id}
                onClick={() => setTab(id)}
                className={classNames(
                  "flex items-center gap-2 border-b-2 px-4 py-4 text-sm font-semibold transition",
                  tab === id
                    ? "border-brand-500 text-brand-600"
                    : "border-transparent text-foreground-muted hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6 sm:p-8">
          {tab === "write" ? (
            <div className="mx-auto max-w-xl">
              <RatingsReviewForm productId={productId} showTitle={false} />
            </div>
          ) : reviewList?.length ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {reviewList.map((review) => (
                <ProductReviewCard
                  key={review._id || review.id}
                  review={review}
                  rating={findRating(review.user?._id)}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No reviews yet"
              description="Be the first to share your experience with this product."
              actionLabel="Write a review"
              onAction={() => setTab("write")}
              className="border-0 bg-transparent py-6"
            />
          )}
        </div>
      </div>
    </section>
  );
}
