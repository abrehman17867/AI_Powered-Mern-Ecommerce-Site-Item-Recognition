import React from "react";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { MinusIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { removeCartItem, updateCartItem } from "../../../State/Cart/Action";
import { classNames } from "../../../utils/classNames";
import {
  unitDiscountedPrice,
  unitPrice,
  lineTotal,
} from "../../../utils/cartPricing";

const formatMoney = (value) =>
  new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);

export default function CartItem({ item, isUpdating = false }) {
  const dispatch = useDispatch();
  const productId = item?.product?._id;
  const qty = Number(item?.quantity) || 1;
  const line = lineTotal(item);
  const unit = unitDiscountedPrice(item);
  const unitOrig = unitPrice(item);
  const discountPct = item?.product?.discountedPersent;
  const hasDiscount = unitOrig > unit;

  const changeQty = (delta) => {
    const next = (item?.quantity || 1) + delta;
    if (next < 1) return;
    dispatch(updateCartItem({ cartItemId: item._id, data: { quantity: next } }));
  };

  const handleRemove = () => {
    dispatch(removeCartItem(item._id));
  };

  return (
    <article
      className={classNames(
        "relative grid gap-4 border-b border-line px-4 py-5 last:border-b-0 sm:grid-cols-[minmax(0,1fr)_6rem_8rem_6rem_2rem] sm:items-center sm:gap-6 sm:px-6",
        isUpdating && "pointer-events-none opacity-60"
      )}
    >
      {isUpdating ? (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 backdrop-blur-[1px]">
          <div
            className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent"
            role="status"
            aria-label="Updating item"
          />
        </div>
      ) : null}

      <div className="flex min-w-0 gap-4 sm:col-span-1">
        <Link
          to={productId ? `/product/${productId}` : "#"}
          className="shrink-0 overflow-hidden rounded-xl border border-line bg-surface-muted"
        >
          <img
            className="h-20 w-20 object-cover sm:h-24 sm:w-24"
            src={item?.product?.imageUrl}
            alt={item?.product?.title || "Product"}
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
          {item?.size ? (
            <p className="mt-1.5 inline-flex rounded-md bg-surface-muted px-2 py-0.5 text-xs font-medium text-foreground-muted">
              Size {item.size}
            </p>
          ) : null}
          {discountPct > 0 ? (
            <span className="ml-2 inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-700">
              {discountPct}% off
            </span>
          ) : null}
        </div>
      </div>

      <div className="flex items-center justify-between sm:contents">
        <div className="sm:text-right">
          <p className="text-xs text-foreground-muted sm:sr-only">Price</p>
          <p className="font-semibold tabular-nums text-foreground">
            {formatMoney(unit)}
          </p>
          {hasDiscount ? (
            <p className="text-xs text-foreground-subtle line-through">
              {formatMoney(unitOrig)}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col items-end sm:items-center">
          <p className="mb-1.5 text-xs text-foreground-muted sm:sr-only">Quantity</p>
          <div className="inline-flex items-center rounded-xl border border-line bg-surface-muted/60">
            <button
              type="button"
              onClick={() => changeQty(-1)}
              disabled={isUpdating || item.quantity <= 1}
              className="flex h-9 w-9 items-center justify-center rounded-l-xl text-foreground-muted transition hover:bg-white hover:text-foreground disabled:opacity-40"
              aria-label="Decrease quantity"
            >
              <MinusIcon className="h-4 w-4" />
            </button>
            <span className="min-w-[2.25rem] text-center text-sm font-semibold tabular-nums">
              {qty}
            </span>
            <button
              type="button"
              onClick={() => changeQty(1)}
              disabled={isUpdating}
              className="flex h-9 w-9 items-center justify-center rounded-r-xl text-foreground-muted transition hover:bg-white hover:text-brand-600 disabled:opacity-40"
              aria-label="Increase quantity"
            >
              <PlusIcon className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="hidden text-right sm:block">
          <p className="text-xs text-foreground-muted sm:sr-only">Total</p>
          <p className="text-base font-bold tabular-nums text-foreground">{formatMoney(line)}</p>
        </div>

        <button
          type="button"
          onClick={handleRemove}
          disabled={isUpdating}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-foreground-muted transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50 sm:justify-self-end"
          aria-label="Remove item"
        >
          <TrashIcon className="h-5 w-5" />
        </button>
      </div>

      <div className="flex items-center justify-between border-t border-line/60 pt-3 sm:hidden">
        <span className="text-sm text-foreground-muted">Line total</span>
        <span className="text-base font-bold tabular-nums text-foreground">{formatMoney(line)}</span>
      </div>
    </article>
  );
}
