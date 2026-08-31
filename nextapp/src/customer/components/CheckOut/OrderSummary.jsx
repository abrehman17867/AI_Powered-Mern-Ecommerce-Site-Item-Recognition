"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  CreditCardIcon,
  LockClosedIcon,
  MapPinIcon,
  ShoppingBagIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import AddressCard from "../AddressCard/AddressCard";
import OrderLineItem from "./OrderLineItem";
import { useDispatch, useSelector } from "react-redux";
import { getOrderById } from "../../../State/Order/Action";
import { useLocation, useNavigate } from "@/lib/navigation";
import { api } from "../../../config/apiConfig";
import { loadStripe } from "@stripe/stripe-js";
import Button from "../../../components/ui/Button";
import LoadingState from "../../../components/ui/LoadingState";
import EmptyState from "../../../components/ui/EmptyState";
import { classNames } from "../../../utils/classNames";

const formatMoney = (value) =>
  new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);

const TRUST = [
  { icon: LockClosedIcon, text: "256-bit SSL encryption" },
  { icon: ShieldCheckIcon, text: "Buyer protection" },
  { icon: CreditCardIcon, text: "Powered by Stripe" },
];

export const OrderSummary = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const orderSlice = useSelector((store) => store.order);
  const searchParams = new URLSearchParams(location.search);
  const orderId = searchParams.get("order_id");
  const [paymentBusy, setPaymentBusy] = useState(false);
  const [paymentError, setPaymentError] = useState(null);

  const order = orderSlice.order;
  const items = order?.orderItems || [];
  const itemCount = useMemo(
    () =>
      (order?.orderItems || []).reduce(
        (sum, item) => sum + (Number(item.quantity) || 1),
        0
      ),
    [order?.orderItems]
  );

  useEffect(() => {
    if (orderId) {
      dispatch(getOrderById(orderId));
    }
  }, [dispatch, orderId]);

  const handleCheckout = async () => {
    setPaymentBusy(true);
    setPaymentError(null);
    try {
      const response = await api.post("/api/payments/create-checkout-session", {
        orderItems: order?.orderItems,
        orderId,
      });
      const sessionId = response.data.sessionId;
      const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
      const { error } = await stripe.redirectToCheckout({ sessionId });
      if (error) {
        setPaymentError(error.message || "Payment could not be started.");
      }
    } catch (error) {
      setPaymentError(
        error.response?.data?.error || error.message || "Payment could not be started."
      );
    }
    setPaymentBusy(false);
  };

  const loading = orderSlice.loading || paymentBusy;
  const initialOrderLoad = orderSlice.loading && !order;

  if (!orderId) {
    return (
      <EmptyState
        title="Order not found"
        description="Complete the shipping step to review and pay."
        actionLabel="Go to shipping"
        onAction={() => navigate("/checkout?step=2")}
      />
    );
  }

  if (initialOrderLoad) {
    return <LoadingState minHeight="min-h-[30vh]" label="Loading your order…" />;
  }

  const paymentPanel = (
    <>
      <div className="space-y-3 px-5 py-5 text-sm sm:px-6">
        <div className="flex items-center justify-between gap-2 rounded-lg bg-surface-muted/60 px-3 py-2">
          <span className="text-xs text-foreground-muted">Order ref</span>
          <span className="font-mono text-xs font-semibold text-foreground">
            #{orderId.slice(-8).toUpperCase()}
          </span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-foreground-muted">
            Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"})
          </span>
          <span className="font-medium tabular-nums text-foreground">
            {formatMoney(order?.totalPrice)}
          </span>
        </div>
        {order?.discounte > 0 ? (
          <div className="flex justify-between gap-4">
            <span className="text-foreground-muted">Savings</span>
            <span className="font-medium tabular-nums text-emerald-600">
              −{formatMoney(order?.discounte)}
            </span>
          </div>
        ) : null}
        <div className="flex justify-between gap-4">
          <span className="text-foreground-muted">Delivery</span>
          <span className="font-medium text-emerald-600">Free</span>
        </div>
        <div className="flex justify-between gap-4 border-t border-line pt-4">
          <span className="text-base font-semibold text-foreground">Total due</span>
          <span className="text-xl font-bold tabular-nums text-brand-600">
            {formatMoney(order?.totalDiscountedPrice)}
          </span>
        </div>
      </div>

      <div className="border-t border-line px-5 py-5 sm:px-6">
        {paymentError ? (
          <div
            className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            role="alert"
          >
            {paymentError}
          </div>
        ) : null}

        <Button
          className="hidden w-full !py-3 lg:flex"
          onClick={handleCheckout}
          disabled={loading || items.length === 0}
        >
          {paymentBusy ? "Redirecting…" : "Pay with Stripe"}
        </Button>

        <ul className="mt-4 space-y-2">
          {TRUST.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-center gap-2 text-xs text-foreground-muted">
              <Icon className="h-4 w-4 shrink-0 text-brand-500" />
              {text}
            </li>
          ))}
        </ul>
      </div>
    </>
  );

  return (
    <div className="pb-28 lg:pb-0">
      <div className="mb-6 flex items-center gap-3 rounded-2xl border border-emerald-200/60 bg-emerald-50/50 px-4 py-3 text-sm text-emerald-800">
        <LockClosedIcon className="h-5 w-5 shrink-0 text-emerald-600" />
        <p>Almost done — review your order below, then pay securely with Stripe.</p>
      </div>

      <div className="grid gap-8 xl:grid-cols-[1fr_min(20rem)] xl:items-start">
        <div className="space-y-6">
          <section className="overflow-hidden rounded-2xl border border-line bg-surface shadow-sm">
            <div className="border-b border-line bg-surface-muted/40 px-5 py-4 sm:px-6">
              <div className="flex items-center gap-2">
                <MapPinIcon className="h-5 w-5 text-brand-500" />
                <div>
                  <h2 className="text-base font-bold text-foreground">Shipping to</h2>
                  <p className="text-xs text-foreground-muted">Delivery address for this order</p>
                </div>
              </div>
            </div>
            <div className="p-5 sm:p-6">
              {order?.shippingAddress ? (
                <AddressCard address={order.shippingAddress} readOnly />
              ) : (
                <p className="text-sm text-foreground-muted">No shipping address on file.</p>
              )}
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl border border-line bg-surface shadow-sm">
            <div className="border-b border-line bg-surface-muted/40 px-5 py-4 sm:px-6">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <ShoppingBagIcon className="h-5 w-5 text-brand-500" />
                  <div>
                    <h2 className="text-base font-bold text-foreground">Order items</h2>
                    <p className="text-xs text-foreground-muted">
                      {items.length} product{items.length === 1 ? "" : "s"} in this order
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {items.length === 0 ? (
              <p className="p-6 text-sm text-foreground-muted">No items in this order.</p>
            ) : (
              <>
                <div className="hidden border-b border-line bg-surface-muted/30 px-6 py-2.5 text-xs font-semibold uppercase tracking-wide text-foreground-muted sm:grid sm:grid-cols-[minmax(0,1fr)_5rem_5rem] sm:gap-6">
                  <span>Product</span>
                  <span className="text-center">Price</span>
                  <span className="text-right">Total</span>
                </div>
                {items.map((item) => (
                  <OrderLineItem key={item._id} item={item} />
                ))}
              </>
            )}
          </section>
        </div>

        <aside className="hidden lg:block lg:sticky lg:top-28">
          <div className="overflow-hidden rounded-2xl border border-line bg-gradient-to-br from-surface via-surface to-brand-50/40 shadow-sm">
            <div className="border-b border-line px-6 py-5">
              <h2 className="text-lg font-bold text-foreground">Payment</h2>
              <p className="mt-1 text-sm text-foreground-muted">Secure checkout with Stripe</p>
            </div>
            {paymentPanel}
          </div>
        </aside>
      </div>

      {/* Mobile payment bar */}
      <div
        className={classNames(
          "fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 px-4 py-3 backdrop-blur-md lg:hidden"
        )}
      >
        <div className="mx-auto flex max-w-app items-center justify-between gap-4">
          <div>
            <p className="text-xs text-foreground-muted">Total due</p>
            <p className="text-lg font-bold tabular-nums text-brand-600">
              {formatMoney(order?.totalDiscountedPrice)}
            </p>
          </div>
          <Button
            className="min-w-[10rem] !py-2.5"
            onClick={handleCheckout}
            disabled={loading || items.length === 0}
          >
            {paymentBusy ? "Redirecting…" : "Pay now"}
          </Button>
        </div>
      </div>

      {/* Mobile payment details (trust + error) */}
      <div className="mt-6 overflow-hidden rounded-2xl border border-line bg-surface shadow-sm lg:hidden">
        <div className="border-b border-line px-5 py-4">
          <h2 className="text-base font-bold text-foreground">Payment summary</h2>
        </div>
        {paymentPanel}
      </div>
    </div>
  );
};

export default OrderSummary;
