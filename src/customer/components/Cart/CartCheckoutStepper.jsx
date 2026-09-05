"use client";

import React from "react";
import { classNames } from "../../../utils/classNames";

const STEPS = [
  { id: "cart", label: "Cart", description: "Review items" },
  { id: "shipping", label: "Shipping", description: "Delivery address" },
  { id: "review", label: "Payment", description: "Review & pay" },
];

export default function CartCheckoutStepper({ active = "cart" }) {
  const activeIndex = STEPS.findIndex((s) => s.id === active);

  return (
    <nav aria-label="Checkout progress" className="mb-8">
      <ol className="flex items-center gap-1 sm:gap-3">
        {STEPS.map((step, index) => {
          const isComplete = index < activeIndex;
          const isCurrent = index === activeIndex;
          return (
            <li key={step.id} className="flex min-w-0 flex-1 items-center gap-1 sm:gap-3">
              {/* The label stacks under the dot on phones and sits beside it from
                  sm up. It used to be `hidden sm:block`, which left mobile with
                  three bare numbered circles and no way to tell what the steps
                  were. Only the longer description is dropped on small screens. */}
              <div className="flex min-w-0 flex-1 flex-col items-center gap-1.5 text-center sm:flex-row sm:items-center sm:gap-3 sm:text-left">
                <span
                  className={classNames(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold sm:h-9 sm:w-9 sm:text-sm",
                    isComplete && "bg-brand-500 text-white",
                    isCurrent && "bg-brand-500 text-white ring-4 ring-brand-500/20",
                    !isComplete && !isCurrent && "bg-zinc-100 text-zinc-500"
                  )}
                >
                  {isComplete ? "✓" : index + 1}
                </span>
                <div className="min-w-0">
                  <p
                    className={classNames(
                      "text-[11px] font-semibold leading-tight sm:text-sm",
                      isCurrent ? "text-foreground" : "text-foreground-muted"
                    )}
                  >
                    {step.label}
                  </p>
                  <p className="hidden text-xs text-foreground-subtle sm:block">
                    {step.description}
                  </p>
                </div>
              </div>
              {index < STEPS.length - 1 ? (
                <div
                  className={classNames(
                    // Pulled up to the dot's centre line, since the label now
                    // sits below the dot on mobile.
                    "mt-4 h-0.5 flex-1 self-start rounded-full sm:mt-0 sm:self-auto",
                    isComplete ? "bg-brand-500" : "bg-line"
                  )}
                  aria-hidden
                />
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
