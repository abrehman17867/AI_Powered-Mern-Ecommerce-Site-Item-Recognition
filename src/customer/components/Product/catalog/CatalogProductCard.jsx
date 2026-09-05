"use client";

import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "@/lib/navigation";
import {
  HeartIcon,
  EyeIcon,
  ArrowsRightLeftIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolid } from "@heroicons/react/24/solid";
import { classNames } from "../../../../utils/classNames";
import { highlightMatch } from "./highlightMatch";
import Button from "../../../../components/ui/Button";

function productBadges(product) {
  const badges = [];
  const discount = Number(product?.discountedPersent) || 0;
  if (discount >= 20) badges.push({ label: "Sale", tone: "sale" });
  const created = product?.createdAt ? new Date(product.createdAt) : null;
  if (created && Date.now() - created.getTime() < 30 * 24 * 60 * 60 * 1000) {
    badges.push({ label: "New", tone: "new" });
  }
  if ((product?.numRatings || 0) >= 3) {
    badges.push({ label: "Trending", tone: "trend" });
  }
  return badges.slice(0, 2);
}

const badgeClass = {
  sale: "bg-red-500 text-white",
  new: "bg-brand-500 text-white",
  trend: "bg-zinc-900 text-white",
};

export default function CatalogProductCard({
  product,
  view = "grid",
  searchQuery = "",
  isWishlisted,
  isCompared,
  onWishlist,
  onCompare,
  onQuickView,
  onAddToCart,
  adding = false,
}) {
  const navigate = useNavigate();
  const [imgHover, setImgHover] = useState(false);
  const badges = useMemo(() => productBadges(product), [product]);
  const inStock = (product?.quantity ?? 0) > 0;
  const secondaryImg = product?.images?.[1] || product?.imageUrl;

  const ratingStars = Math.min(5, Math.round((product?.numRatings || 0) / 2));

  const iconBtnClass =
    view === "list"
      ? "flex h-8 w-8 items-center justify-center rounded-full bg-white/95 shadow-md transition hover:scale-105"
      : "flex h-9 w-9 items-center justify-center rounded-full bg-white/95 shadow-md transition hover:scale-110";

  const actionIcons = (
    <>
      <button
        type="button"
        aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onWishlist?.(product);
        }}
        className={iconBtnClass}
      >
        {isWishlisted ? (
          <HeartSolid className="h-4 w-4 text-red-500 sm:h-5 sm:w-5" />
        ) : (
          <HeartIcon className="h-4 w-4 text-zinc-700 sm:h-5 sm:w-5" />
        )}
      </button>
      <button
        type="button"
        aria-label="Quick view"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onQuickView?.(product);
        }}
        className={iconBtnClass}
      >
        <EyeIcon className="h-4 w-4 text-zinc-700 sm:h-5 sm:w-5" />
      </button>
      <button
        type="button"
        aria-label={isCompared ? "Remove from compare" : "Add to compare"}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onCompare?.(product);
        }}
        className={classNames(iconBtnClass, isCompared && "ring-2 ring-brand-500")}
      >
        <ArrowsRightLeftIcon className="h-4 w-4 text-zinc-700 sm:h-5 sm:w-5" />
      </button>
    </>
  );

  const badgeRow = badges.length > 0 && (
    <div className="flex flex-wrap gap-1">
      {badges.map((b) => (
        <span
          key={b.label}
          className={classNames(
            "rounded-lg px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
            badgeClass[b.tone]
          )}
        >
          {b.label}
        </span>
      ))}
    </div>
  );

  const cardInner = (
    <>
      <div
        className={classNames(
          "group relative overflow-hidden bg-zinc-50",
          view === "grid" ? "aspect-[4/5]" : "h-36 w-36 shrink-0 rounded-xl"
        )}
        onMouseEnter={() => setImgHover(true)}
        onMouseLeave={() => setImgHover(false)}
      >
        <img
          src={imgHover && secondaryImg ? secondaryImg : product?.imageUrl}
          alt={product?.title || "Product"}
          loading="lazy"
          className="h-full w-full object-cover object-center transition duration-500 group-hover:scale-105"
        />
        <div className="absolute left-2 top-2 z-10">{badgeRow}</div>
        <div
          className={classNames(
            "absolute right-2 top-2 z-10 flex flex-col gap-1",
            view === "list"
              ? "opacity-100"
              : "opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100"
          )}
        >
          {actionIcons}
        </div>
      </div>

      <div
        className={classNames(
          "flex flex-1 flex-col",
          view === "grid" ? "px-4 pt-4" : "min-w-0 flex-1 py-1 pr-1"
        )}
      >
        {view === "list" && badgeRow ? <div className="mb-2">{badgeRow}</div> : null}
        <p className="text-xs font-semibold uppercase tracking-wide text-foreground-muted">
          {product?.brand}
        </p>
        <Link
          to={`/product/${product?._id}`}
          className="mt-1 line-clamp-2 text-sm font-medium text-foreground hover:text-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
        >
          {highlightMatch(product?.title, searchQuery)}
        </Link>
        <div className="mt-1 flex items-center gap-1 text-amber-500" aria-label={`${ratingStars} stars`}>
          {Array.from({ length: 5 }).map((_, i) => (
            <span key={i} className={i < ratingStars ? "opacity-100" : "opacity-25"}>
              ★
            </span>
          ))}
          <span className="ml-1 text-xs text-foreground-muted">
            ({product?.numRatings || 0})
          </span>
        </div>
        <div className="mt-2 flex flex-wrap items-baseline gap-2">
          <span className="text-lg font-bold text-foreground">
            ${product?.discountedPrice ?? product?.price}
          </span>
          {product?.price > product?.discountedPrice && (
            <span className="text-sm text-foreground-muted line-through">
              ${product?.price}
            </span>
          )}
          {product?.discountedPersent > 0 && (
            <span className="text-xs font-semibold text-emerald-600">
              {product.discountedPersent}% off
            </span>
          )}
        </div>
        <p
          className={classNames(
            "mt-1 text-xs font-medium",
            inStock ? "text-emerald-600" : "text-red-600"
          )}
        >
          {inStock ? "In stock" : "Out of stock"}
        </p>
        {view === "list" && (
          <div className="mt-3 flex gap-2">
            <Button
              size="sm"
              variant="secondary"
              className="min-w-0 flex-1 justify-center"
              onClick={(e) => {
                e.preventDefault();
                onQuickView?.(product);
              }}
            >
              Quick view
            </Button>
            <Button
              size="sm"
              className="min-w-0 flex-1 justify-center"
              disabled={!inStock}
              loading={adding}
              loadingLabel="Adding…"
              onClick={(e) => {
                e.preventDefault();
                onAddToCart?.(product);
              }}
            >
              Add to cart
            </Button>
          </div>
        )}
      </div>
    </>
  );

  if (view === "list") {
    return (
      <article className="group flex gap-4 rounded-2xl border border-line bg-white p-3 shadow-sm transition hover:shadow-md sm:gap-5 sm:p-4">
        {cardInner}
      </article>
    );
  }

  return (
    <article className="group flex flex-col rounded-2xl border border-line bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
      {cardInner}
      <div className="mt-auto space-y-2 px-4 pb-4 pt-3">
        <Button
          className="w-full justify-center"
          size="sm"
          disabled={!inStock}
          loading={adding}
          loadingLabel="Adding…"
          onClick={() => onAddToCart?.(product)}
        >
          Add to cart
        </Button>
        <Button
          variant="secondary"
          size="sm"
          className="w-full justify-center"
          type="button"
          onClick={() => navigate(`/product/${product?._id}`)}
        >
          Buy now
        </Button>
      </div>
    </article>
  );
}
