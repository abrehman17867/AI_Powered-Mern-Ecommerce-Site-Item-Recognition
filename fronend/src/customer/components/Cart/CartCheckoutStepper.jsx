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
              <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
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
                <div className="min-w-0 hidden sm:block">
                  <p
                    className={classNames(
                      "text-sm font-semibold",
                      isCurrent ? "text-foreground" : "text-foreground-muted"
                    )}
                  >
                    {step.label}
                  </p>
                  <p className="text-xs text-foreground-subtle">{step.description}</p>
                </div>
              </div>
              {index < STEPS.length - 1 ? (
                <div
                  className={classNames(
                    "h-0.5 flex-1 rounded-full",
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
