"use client";

import React, { useEffect, useState } from "react";
import { Link } from "@/lib/navigation";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { api } from "../../../config/apiConfig";
import HomeProductCard from "../Home/HomeProductCard";
import { Skeleton } from "../../../components/ui/Skeleton";

const MAX_ITEMS = 4;

function RelatedSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
      {Array.from({ length: MAX_ITEMS }).map((_, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-sm"
        >
          <Skeleton className="aspect-[4/5] w-full" rounded="rounded-none" />
          <div className="space-y-2 p-4">
            <Skeleton className="h-2.5 w-14" />
            <Skeleton className="h-3.5 w-full" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * "More from this category" strip under the product detail page.
 *
 * Deliberately fetches with a plain api call instead of dispatching
 * `findProducts`: the products slice is shared with the catalog, so writing
 * this sibling list into it would replace whatever page the shopper had
 * loaded and make going back show the wrong results.
 */
export default function ProductRelated({ productId, category }) {
  const categoryId = category?._id ? String(category._id) : "";
  const categoryName = category?.name || "";

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(Boolean(categoryId));

  useEffect(() => {
    if (!categoryId) {
      setItems([]);
      setLoading(false);
      return undefined;
    }

    let cancelled = false;
    setLoading(true);
    api
      .get(`/api/products`, {
        // Ask for one extra so removing the current product still leaves a
        // full row.
        params: { category: categoryId, pageSize: MAX_ITEMS + 1, pageNumber: 1, sort: "newest" },
      })
      .then(({ data }) => {
        if (cancelled) return;
        const list = Array.isArray(data?.content) ? data.content : [];
        setItems(
          list.filter((p) => String(p._id) !== String(productId)).slice(0, MAX_ITEMS)
        );
      })
      .catch(() => {
        if (!cancelled) setItems([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [categoryId, productId]);

  // Nothing to recommend — stay out of the way rather than leaving an empty
  // heading on the page.
  if (!loading && items.length === 0) return null;

  return (
    <section className="mt-12 border-t border-line pt-10 md:mt-16 md:pt-12">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">
            Keep browsing
          </p>
          <h2 className="mt-1 text-xl font-bold text-foreground sm:text-2xl">
            {categoryName ? `More from ${categoryName}` : "You might also like"}
          </h2>
        </div>
        {categoryId ? (
          <Link
            to={`/products?category=${categoryId}`}
            className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-brand-600 transition hover:text-brand-700"
          >
            View all
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        ) : null}
      </div>

      {loading ? (
        <RelatedSkeleton />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
          {items.map((product) => (
            <HomeProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}
