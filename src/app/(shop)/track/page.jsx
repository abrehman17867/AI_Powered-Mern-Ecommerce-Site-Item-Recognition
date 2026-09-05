"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "@/lib/navigation";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import PageLayout from "@/components/layout/PageLayout";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import OrderTimeline from "@/customer/components/Order/OrderTimeline";
import TrackingNumber from "@/customer/components/Order/TrackingNumber";
import { api } from "@/config/apiConfig";
import { getOrderStatusMeta, toneClasses } from "@/utils/orderUtils";
import { classNames } from "@/utils/classNames";

/**
 * Track an order without signing in.
 *
 * The endpoint deliberately returns only status and timing — no address, name
 * or prices — because the tracking number alone is the only credential here.
 */
export default function TrackOrderPage() {
  const [searchParams] = useSearchParams();
  const [code, setCode] = useState("");
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const lookup = useCallback(async (value) => {
    const trimmed = String(value || "").trim();
    if (!trimmed) return;
    setBusy(true);
    setError(null);
    setOrder(null);
    try {
      const { data } = await api.get(`/api/orders/track`, { params: { code: trimmed } });
      setOrder(data);
    } catch (err) {
      setError(err?.response?.data?.error || "Could not look up that order.");
    } finally {
      setBusy(false);
    }
  }, []);

  // Deep link from the payment success screen: /track?code=EC-XXX-XXX-XXX
  useEffect(() => {
    const initial = searchParams?.get("code");
    if (initial) {
      setCode(initial);
      lookup(initial);
    }
  }, [searchParams, lookup]);

  const meta = order ? getOrderStatusMeta(order.orderStatus) : null;

  return (
    <PageLayout
      eyebrow="Orders"
      title="Track your order"
      description="Enter the tracking number from your confirmation to see where your parcel is."
    >
      <form
        className="flex flex-col gap-3 sm:flex-row"
        onSubmit={(e) => {
          e.preventDefault();
          lookup(code);
        }}
      >
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-foreground-muted" />
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="EC-XXX-XXX-XXX"
            aria-label="Tracking number"
            autoComplete="off"
            className="ui-input pl-10 font-mono uppercase tracking-wider"
          />
        </div>
        <Button type="submit" loading={busy} loadingLabel="Searching…" className="sm:w-auto">
          Track order
        </Button>
      </form>

      {error ? (
        <div className="mt-8">
          <EmptyState title="Order not found" description={error} />
        </div>
      ) : null}

      {order ? (
        <div className="mt-8 space-y-5">
          <div className="flex flex-col gap-4 rounded-2xl border border-line bg-surface p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-foreground-muted">
                Tracking number
              </p>
              <TrackingNumber value={order.trackingNumber} size="lg" className="mt-2" />
            </div>
            <div className="sm:text-right">
              <span
                className={classNames(
                  "inline-flex rounded-full px-3 py-1 text-sm font-semibold ring-1",
                  toneClasses[meta.tone]
                )}
              >
                {meta.label}
              </span>
              <p className="mt-2 text-sm text-foreground-muted">
                {order.totalItem} item{order.totalItem === 1 ? "" : "s"}
              </p>
            </div>
          </div>

          <OrderTimeline order={order} />
        </div>
      ) : null}
    </PageLayout>
  );
}
