import React from "react";
import { classNames } from "../../../utils/classNames";

const STEPS = [
  { step: 2, label: "Shipping", description: "Delivery address" },
  { step: 3, label: "Review & pay", description: "Order & payment" },
];

export default function CheckoutStepper({ currentStep }) {
  const activeIndex = currentStep >= 3 ? 1 : 0;

  return (
    <nav aria-label="Checkout progress" className="mb-8">
      <ol className="flex items-center gap-2 sm:gap-4">
        {STEPS.map((item, index) => {
          const isComplete = index < activeIndex;
          const isCurrent = index === activeIndex;
          return (
            <li key={item.step} className="flex min-w-0 flex-1 items-center gap-2 sm:gap-4">
              <div className="flex min-w-0 flex-1 flex-col items-center text-center sm:flex-row sm:items-center sm:text-left">
                <span
                  className={classNames(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold transition",
                    isComplete && "bg-brand-500 text-white",
                    isCurrent && "bg-brand-500 text-white ring-4 ring-brand-500/20",
                    !isComplete && !isCurrent && "bg-zinc-100 text-zinc-500"
                  )}
                >
                  {isComplete ? (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </span>
                <div className="mt-2 min-w-0 sm:ml-3 sm:mt-0">
                  <p
                    className={classNames(
                      "text-xs font-semibold sm:text-sm",
                      isCurrent ? "text-foreground" : "text-foreground-muted"
                    )}
                  >
                    {item.label}
                  </p>
                  <p className="hidden text-xs text-foreground-subtle sm:block">{item.description}</p>
                </div>
              </div>
              {index < STEPS.length - 1 ? (
                <div
                  className={classNames(
                    "hidden h-0.5 flex-1 sm:block",
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
