"use client";

import React, { useEffect, useMemo } from "react";
import { Link, useNavigate } from "@/lib/navigation";
import {
  ShoppingBagIcon,
  TruckIcon,
  ShieldCheckIcon,
  LockClosedIcon,
} from "@heroicons/react/24/outline";
import CartItem from "./CartItem";
import CartCheckoutStepper from "./CartCheckoutStepper";
import { useDispatch, useSelector } from "react-redux";
import { getCart } from "../../../State/Cart/Action";
import PageLayout from "../../../components/layout/PageLayout";
import Button from "../../../components/ui/Button";
import LoadingState from "../../../components/ui/LoadingState";
import EmptyState from "../../../components/ui/EmptyState";
import { classNames } from "../../../utils/classNames";
import useBottomBarOffset from "../../../hooks/useBottomBarOffset";

const formatMoney = (value) =>
  new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);

const TRUST = [
  { icon: TruckIcon, text: "Free delivery over $50" },
  { icon: ShieldCheckIcon, text: "Easy returns" },
  { icon: LockClosedIcon, text: "Secure checkout" },
];

export default function Cart() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { cart, loading, pendingItemIds, removingItemId, error } = useSelector(
    (store) => store.cart
  );

  const items = useMemo(() => cart?.cartItems || [], [cart?.cartItems]);
  const itemCount = useMemo(
    () => items.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0),
    [items]
  );

  // Lifts bottom-anchored overlays (the toast container) above the fixed
  // mobile checkout bar below.
  useBottomBarOffset(items.length > 0);

  const initialLoad = loading && items.length === 0;
  const isEmpty = !initialLoad && !error && items.length === 0;
  const isLoggedIn = Boolean(localStorage.getItem("jwt"));

  useEffect(() => {
    dispatch(getCart());
  }, [dispatch]);

  const handleCheckout = () => {
    navigate("/checkout?step=2");
  };

  return (
    <PageLayout
      eyebrow="Your bag"
      title="Shopping cart"
      description={
        itemCount > 0
          ? `${itemCount} item${itemCount === 1 ? "" : "s"} — almost there.`
          : "Items you add will appear here."
      }
      actions={
        items.length > 0 ? (
          <Link
            to="/products"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 transition hover:text-brand-700"
          >
            <ShoppingBagIcon className="h-4 w-4" />
            Continue shopping
          </Link>
        ) : null
      }
      className={items.length > 0 ? "pb-28 lg:pb-16" : undefined}
    >
      {items.length > 0 && <CartCheckoutStepper active="cart" />}

      {initialLoad ? (
        <LoadingState minHeight="min-h-[30vh]" label="Loading your cart…" />
      ) : error ? (
        <EmptyState
          title="Could not load cart"
          description={error}
          actionLabel={isLoggedIn ? "Try again" : "Sign in"}
          onAction={() =>
            isLoggedIn
              ? dispatch(getCart())
              : navigate("/login", { state: { from: "/cart" } })
          }
        />
      ) : isEmpty ? (
        <div className="mx-auto max-w-lg">
          <EmptyState
            title="Your cart is empty"
            description={
              isLoggedIn
                ? "Discover something you love and add it to your bag."
                : "Sign in to sync your cart across devices."
            }
            actionLabel={isLoggedIn ? "Browse products" : "Sign in"}
            onAction={() =>
              isLoggedIn
                ? navigate("/products")
                : navigate("/login", { state: { from: "/cart" } })
            }
            icon={<ShoppingBagIcon className="h-12 w-12" />}
          />
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1fr_min(20rem,100%)] lg:items-start lg:gap-10">
          <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-sm">
            <div className="hidden border-b border-line bg-surface-muted/50 px-6 py-3 text-xs font-semibold uppercase tracking-wide text-foreground-muted sm:grid sm:grid-cols-[minmax(0,1fr)_6rem_8rem_6rem_2rem] sm:gap-6">
              <span>Product</span>
              <span className="text-right">Price</span>
              <span className="text-center">Qty</span>
              <span className="text-right">Total</span>
              <span className="sr-only">Remove</span>
            </div>
            {items.map((item) => (
              <CartItem
                key={item._id}
                item={item}
                isUpdating={pendingItemIds.includes(item._id)}
                isRemoving={removingItemId === item._id}
              />
            ))}
          </div>

          <aside className="lg:sticky lg:top-28">
            <div className="overflow-hidden rounded-2xl border border-line bg-gradient-to-br from-surface via-surface to-brand-50/40 shadow-sm">
              <div className="border-b border-line px-6 py-5">
                <h2 className="text-lg font-bold text-foreground">Order summary</h2>
                <p className="mt-1 text-sm text-foreground-muted">
                  Taxes and shipping calculated at checkout.
                </p>
              </div>

              <div className="space-y-3 px-6 py-5 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-foreground-muted">
                    Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"})
                  </span>
                  <span className="font-medium tabular-nums text-foreground">
                    {formatMoney(cart?.totalPrice)}
                  </span>
                </div>
                {cart?.discounte > 0 ? (
                  <div className="flex justify-between gap-4">
                    <span className="text-foreground-muted">Savings</span>
                    <span className="font-medium tabular-nums text-emerald-600">
                      −{formatMoney(cart?.discounte)}
                    </span>
                  </div>
                ) : null}
                <div className="flex justify-between gap-4">
                  <span className="text-foreground-muted">Estimated delivery</span>
                  <span className="font-medium text-emerald-600">Free</span>
                </div>
                <div className="flex justify-between gap-4 border-t border-line pt-4">
                  <span className="text-base font-semibold text-foreground">Total</span>
                  <span className="text-xl font-bold tabular-nums text-brand-600">
                    {formatMoney(cart?.totalDiscountedPrice)}
                  </span>
                </div>
              </div>

              <div className="border-t border-line px-6 py-5">
                <Button
                  className="w-full !py-3"
                  onClick={handleCheckout}
                  disabled={Boolean(removingItemId)}
                >
                  Proceed to checkout
                </Button>
                <ul className="mt-4 space-y-2">
                  {TRUST.map(({ icon: Icon, text }) => (
                    <li
                      key={text}
                      className="flex items-center gap-2 text-xs text-foreground-muted"
                    >
                      <Icon className="h-4 w-4 shrink-0 text-brand-500" />
                      {text}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </aside>
        </div>
      )}

      {items.length > 0 && (
        <div
          className={classNames(
            "fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 px-4 py-3 backdrop-blur-md lg:hidden",
            "safe-area-pb"
          )}
        >
          <div className="mx-auto flex max-w-app items-center justify-between gap-4">
            <div>
              <p className="text-xs text-foreground-muted">Total</p>
              <p className="text-lg font-bold tabular-nums text-brand-600">
                {formatMoney(cart?.totalDiscountedPrice)}
              </p>
            </div>
            <Button
              className="min-w-[10rem] !py-2.5"
              onClick={handleCheckout}
              disabled={Boolean(removingItemId)}
            >
              Checkout
            </Button>
          </div>
        </div>
      )}
    </PageLayout>
  );
}
