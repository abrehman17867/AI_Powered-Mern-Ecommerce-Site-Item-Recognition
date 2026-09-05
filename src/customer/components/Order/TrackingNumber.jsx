"use client";

import React, { useEffect, useState } from "react";
import { CheckIcon, ClipboardDocumentIcon } from "@heroicons/react/24/outline";
import { classNames } from "../../../utils/classNames";

/**
 * The order's tracking reference with a copy button.
 *
 * Shown wherever a shopper might want to quote it — the payment success
 * screen, the order list and the order detail page — so the code always looks
 * and behaves the same.
 */
export default function TrackingNumber({ value, size = "md", className }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return undefined;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  if (!value) return null;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
    } catch {
      /* clipboard blocked (insecure origin or denied) — the code is still visible */
    }
  };

  return (
    <div
      className={classNames(
        "inline-flex items-center gap-2 rounded-xl border border-line bg-surface-muted/60 px-3 py-2",
        className
      )}
    >
      <span
        className={classNames(
          "font-mono font-semibold tracking-wider text-foreground",
          size === "lg" ? "text-base sm:text-lg" : "text-sm"
        )}
      >
        {value}
      </span>
      <button
        type="button"
        onClick={copy}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-foreground-muted transition hover:bg-white hover:text-brand-600"
        aria-label={copied ? "Tracking number copied" : "Copy tracking number"}
      >
        {copied ? (
          <CheckIcon className="h-4 w-4 text-emerald-600" />
        ) : (
          <ClipboardDocumentIcon className="h-4 w-4" />
        )}
      </button>
    </div>
  );
}
