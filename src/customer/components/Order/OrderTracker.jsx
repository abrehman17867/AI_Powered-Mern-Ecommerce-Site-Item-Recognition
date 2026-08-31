"use client";

import React from "react";
import {
  CheckIcon,
  TruckIcon,
  CubeIcon,
  MapPinIcon,
  ShoppingBagIcon,
} from "@heroicons/react/24/outline";
import { classNames } from "../../../utils/classNames";
import { TRACKER_STEPS } from "../../../utils/orderUtils";

const STEP_ICONS = [ShoppingBagIcon, CubeIcon, TruckIcon, MapPinIcon, CheckIcon];

export default function OrderTracker({ activeStep = 0, cancelled = false }) {
  if (cancelled) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50/60 px-5 py-4 text-center text-sm text-red-800">
        This order was cancelled and will not be shipped.
      </div>
    );
  }

  const step = Math.max(0, Math.min(activeStep, TRACKER_STEPS.length - 1));

  return (
    <div className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
      <ol className="grid gap-4 sm:grid-cols-5 sm:gap-2">
        {TRACKER_STEPS.map((item, index) => {
          const done = index < step;
          const current = index === step;
          const Icon = STEP_ICONS[index];

          return (
            <li key={item.key} className="relative flex sm:flex-col sm:items-center sm:text-center">
              {index < TRACKER_STEPS.length - 1 ? (
                <span
                  className={classNames(
                    "absolute left-5 top-10 hidden h-0.5 w-[calc(100%-2.5rem)] sm:left-[calc(50%+1.25rem)] sm:top-5 sm:block sm:h-0.5 sm:w-[calc(100%-2.5rem)]",
                    done ? "bg-brand-500" : "bg-line"
                  )}
                  aria-hidden
                />
              ) : null}

              <div className="flex items-start gap-3 sm:flex-col sm:items-center sm:gap-2">
                <span
                  className={classNames(
                    "relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition",
                    done
                      ? "border-brand-500 bg-brand-500 text-white"
                      : current
                        ? "border-brand-500 bg-brand-50 text-brand-600"
                        : "border-line bg-surface-muted text-foreground-muted"
                  )}
                >
                  {done ? (
                    <CheckIcon className="h-5 w-5" strokeWidth={2.5} />
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                </span>
                <div className="min-w-0 pt-0.5 sm:pt-0">
                  <p
                    className={classNames(
                      "text-sm font-semibold",
                      current || done ? "text-foreground" : "text-foreground-muted"
                    )}
                  >
                    {item.label}
                  </p>
                  {current ? (
                    <p className="mt-0.5 text-xs text-brand-600 sm:hidden">Current step</p>
                  ) : null}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
