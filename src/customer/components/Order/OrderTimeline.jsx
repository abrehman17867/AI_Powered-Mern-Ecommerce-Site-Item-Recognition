"use client";

import React, { useMemo } from "react";
import { classNames } from "../../../utils/classNames";
import { estimatedDeliveryDate, TRACKER_STEPS } from "../../../utils/orderUtils";

const STEP_FOR_STATUS = {
  PENDING: 0,
  PAID: 1,
  CONFIRMED: 1,
  SHIPPED: 2,
  OUT_FOR_DELIVERY: 3,
  DELIVERED: 4,
};

const fmt = (date) =>
  date
    ? new Date(date).toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : null;

/**
 * Vertical delivery timeline driven by the order's recorded status history.
 *
 * The existing tracker infers a single "current step" from the order's status
 * alone, which can show where an order is but never when it got there. This
 * pairs each step with the timestamp actually recorded for it, and falls back
 * to the inferred step for orders placed before history was captured.
 */
export default function OrderTimeline({ order, className }) {
  const { reachedAt, currentStep, cancelled } = useMemo(() => {
    const history = order?.statusHistory || [];
    const times = {};

    for (const entry of history) {
      const idx = STEP_FOR_STATUS[String(entry.status || "").toUpperCase()];
      if (idx === undefined) continue;
      // Keep the first time a step was reached, not the last.
      if (!times[idx]) times[idx] = entry.at;
    }

    const status = String(order?.orderStatus || "PENDING").toUpperCase();
    const inferred = STEP_FOR_STATUS[status] ?? 0;
    const fromHistory = Object.keys(times).map(Number);
    const highest = fromHistory.length ? Math.max(...fromHistory) : -1;

    return {
      reachedAt: times,
      currentStep: Math.max(inferred, highest),
      cancelled: status === "CANCELLED",
    };
  }, [order]);

  if (cancelled) {
    return (
      <div className={classNames("rounded-2xl border border-red-200 bg-red-50 p-5", className)}>
        <p className="text-sm font-semibold text-red-800">Order cancelled</p>
        <p className="mt-1 text-sm text-red-700">
          This order was cancelled and will not be delivered.
        </p>
      </div>
    );
  }

  const eta = estimatedDeliveryDate(order);
  const delivered = currentStep >= 4;

  return (
    <div className={classNames("rounded-2xl border border-line bg-surface p-5 sm:p-6", className)}>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-bold uppercase tracking-wide text-foreground-muted">
          Delivery status
        </h3>
        <p className="text-sm text-foreground-muted">
          {delivered ? "Delivered" : "Estimated"}{" "}
          <span className="font-semibold text-foreground">
            {new Date(delivered && order?.deliveryDate ? order.deliveryDate : eta).toLocaleDateString(
              undefined,
              { weekday: "short", month: "short", day: "numeric" }
            )}
          </span>
        </p>
      </div>

      <ol className="relative">
        {TRACKER_STEPS.map((step, index) => {
          const done = index < currentStep;
          const current = index === currentStep;
          const at = reachedAt[index];
          const isLast = index === TRACKER_STEPS.length - 1;

          return (
            // The spacing lives on the text column, so the rail column
            // stretches the full row height and its flex-1 connector actually
            // has room to fill. With the padding on the <li> the connector
            // collapsed to a few pixels.
            <li key={step.key} className="flex gap-4">
              <div className="flex flex-col items-center self-stretch">
                <span
                  className={classNames(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ring-4",
                    done && "bg-brand-500 text-white ring-brand-500/15",
                    current && "bg-brand-500 text-white ring-brand-500/25",
                    !done && !current && "bg-zinc-100 text-zinc-400 ring-transparent"
                  )}
                >
                  {done ? (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </span>
                {!isLast ? (
                  <span
                    className={classNames(
                      "my-1 w-0.5 flex-1 rounded-full",
                      done ? "bg-brand-500" : "bg-line"
                    )}
                    aria-hidden
                  />
                ) : null}
              </div>

              <div className={classNames("min-w-0 pt-1", isLast ? "pb-1" : "pb-6")}>
                <p
                  className={classNames(
                    "text-sm font-semibold",
                    done || current ? "text-foreground" : "text-foreground-muted"
                  )}
                >
                  {step.label}
                </p>
                <p className="mt-0.5 text-xs text-foreground-subtle">
                  {at ? fmt(at) : current ? "In progress" : "Pending"}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
