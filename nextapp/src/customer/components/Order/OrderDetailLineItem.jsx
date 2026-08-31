"use client";

import React from "react";
import { Link, useNavigate } from "@/lib/navigation";
import { StarIcon } from "@heroicons/react/24/outline";
import { lineTotal, unitDiscountedPrice } from "../../../utils/cartPricing";
import { formatMoney } from "../../../utils/orderUtils";
import Button from "../../../components/ui/Button";

export default function OrderDetailLineItem({ item, showReview = false }) {
  const navigate = useNavigate();
  const productId = item?.product?._id;
  const qty = Number(item?.quantity) || 1;
  const unitPrice = unitDiscountedPrice(item);
  const total = lineTotal(item);

  return (
    <article className="grid gap-4 border-b border-line px-4 py-5 last:border-b-0 sm:grid-cols-[minmax(0,1fr)_5rem_5rem_auto] sm:items-center sm:gap-6 sm:px-6">
      <div className="flex min-w-0 gap-4">
        <Link
          to={productId ? `/product/${productId}` : "#"}
          className="shrink-0 overflow-hidden rounded-xl border border-line bg-surface-muted"
        >
          <img
            src={item?.product?.imageUrl}
            alt={item?.product?.title || "Product"}
            className="h-20 w-20 object-cover sm:h-24 sm:w-24"
          />
        </Link>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-foreground-muted">
            {item?.product?.brand}
          </p>
          <Link
            to={productId ? `/product/${productId}` : "#"}
            className="mt-0.5 line-clamp-2 text-sm font-semibold text-foreground hover:text-brand-600 sm:text-base"
          >
            {item?.product?.title}
          </Link>
          <div className="mt-2 flex flex-wrap gap-2">
            {item?.product?.color ? (
              <span className="rounded-md bg-surface-muted px-2 py-0.5 text-xs font-medium text-foreground-muted">
                {item.product.color}
              </span>
            ) : null}
            {item?.size ? (
              <span className="rounded-md bg-surface-muted px-2 py-0.5 text-xs font-medium text-foreground-muted">
                Size {item.size}
              </span>
            ) : null}
            <span className="rounded-md bg-surface-muted px-2 py-0.5 text-xs font-medium text-foreground-muted">
              Qty {qty}
            </span>
          </div>
        </div>
      </div>

      <p className="text-right text-sm font-medium tabular-nums text-foreground sm:text-center">
        <span className="text-foreground-muted sm:hidden">Price: </span>
        {formatMoney(unitPrice)}
      </p>

      <p className="text-right text-base font-bold tabular-nums text-foreground">
        <span className="text-sm font-normal text-foreground-muted sm:hidden">Total: </span>
        {formatMoney(total)}
      </p>

      {showReview && productId ? (
        <div className="sm:justify-self-end">
          <Button
            variant="secondary"
            size="sm"
            className="w-full sm:w-auto"
            onClick={() => navigate(`/rate-review/${productId}`)}
          >
            <StarIcon className="mr-1.5 h-4 w-4" />
            Rate & review
          </Button>
        </div>
      ) : (
        <span className="hidden sm:block" aria-hidden />
      )}
    </article>
  );
}
