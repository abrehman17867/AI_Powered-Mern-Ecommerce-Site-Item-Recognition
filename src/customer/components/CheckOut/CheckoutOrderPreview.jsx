"use client";

import React, { useEffect, useMemo } from "react";
import { Link } from "@/lib/navigation";
import { useDispatch, useSelector } from "react-redux";
import { getCart } from "../../../State/Cart/Action";

const formatMoney = (value) =>
  new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);

export default function CheckoutOrderPreview() {
  const dispatch = useDispatch();
  const { cart, loading } = useSelector((store) => store.cart);

  const items = useMemo(() => cart?.cartItems || [], [cart?.cartItems]);
  const itemCount = useMemo(
    () => items.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0),
    [items]
  );

  useEffect(() => {
    dispatch(getCart({ silent: true }));
  }, [dispatch]);

  if (loading && items.length === 0) {
    return (
      <aside className="animate-pulse rounded-2xl border border-line bg-surface p-6">
        <div className="h-5 w-32 rounded bg-zinc-100" />
        <div className="mt-4 space-y-3">
          <div className="h-14 rounded-xl bg-zinc-100" />
          <div className="h-14 rounded-xl bg-zinc-100" />
        </div>
      </aside>
    );
  }

  if (items.length === 0) {
    return (
      <aside className="rounded-2xl border border-line bg-surface p-6 text-sm text-foreground-muted">
        <p>Your cart is empty.</p>
        <Link to="/products" className="mt-2 inline-block font-semibold text-brand-600 hover:text-brand-700">
          Shop products
        </Link>
      </aside>
    );
  }

  const preview = items.slice(0, 3);
  const extra = items.length - preview.length;

  return (
    <aside className="overflow-hidden rounded-2xl border border-line bg-gradient-to-br from-surface via-surface to-brand-50/30 shadow-sm lg:sticky lg:top-28">
      <div className="border-b border-line px-5 py-4">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-bold text-foreground">In your bag</h3>
          <Link to="/cart" className="text-xs font-semibold text-brand-600 hover:text-brand-700">
            Edit
          </Link>
        </div>
        <p className="mt-0.5 text-xs text-foreground-muted">
          {itemCount} item{itemCount !== 1 ? "s" : ""}
        </p>
      </div>

      <ul className="divide-y divide-line px-5">
        {preview.map((item) => (
          <li key={item._id} className="flex gap-3 py-3">
            <img
              src={item?.product?.imageUrl}
              alt=""
              className="h-14 w-14 shrink-0 rounded-lg border border-line object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="line-clamp-1 text-sm font-medium text-foreground">
                {item?.product?.title}
              </p>
              <p className="text-xs text-foreground-muted">
                Qty {item.quantity}
                {item.size ? ` · ${item.size}` : ""}
              </p>
              <p className="mt-0.5 text-sm font-semibold tabular-nums text-foreground">
                {formatMoney((item.discountedPrice || 0) * (item.quantity || 1))}
              </p>
            </div>
          </li>
        ))}
      </ul>

      {extra > 0 && (
        <p className="px-5 pb-2 text-xs text-foreground-muted">+{extra} more item{extra !== 1 ? "s" : ""}</p>
      )}

      <div className="space-y-2 border-t border-line px-5 py-4 text-sm">
        <div className="flex justify-between text-foreground-muted">
          <span>Subtotal</span>
          <span className="tabular-nums text-foreground">{formatMoney(cart?.totalPrice)}</span>
        </div>
        {cart?.discounte > 0 && (
          <div className="flex justify-between text-emerald-600">
            <span>Savings</span>
            <span className="tabular-nums">−{formatMoney(cart?.discounte)}</span>
          </div>
        )}
        <div className="flex justify-between border-t border-line pt-3 font-semibold text-foreground">
          <span>Total</span>
          <span className="text-lg tabular-nums text-brand-600">
            {formatMoney(cart?.totalDiscountedPrice)}
          </span>
        </div>
      </div>
    </aside>
  );
}
