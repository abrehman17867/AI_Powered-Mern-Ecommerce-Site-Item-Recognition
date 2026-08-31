"use client";

import React from "react";
import { MapPinIcon, PhoneIcon } from "@heroicons/react/24/outline";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { classNames } from "../../../utils/classNames";

export default function AddressCard({
  address,
  selected = false,
  onSelect,
  name: groupName = "saved-address",
  disabled = false,
  readOnly = false,
}) {
  const displayName = [address?.firstName, address?.lastName].filter(Boolean).join(" ");

  const handleActivate = () => {
    if (readOnly || disabled || !onSelect) return;
    onSelect();
  };

  const content = (
    <>
      {selected && !readOnly && (
        <CheckCircleIcon
          className="absolute right-4 top-4 h-5 w-5 text-brand-500"
          aria-hidden
        />
      )}

      <div className="flex items-start gap-3">
        <span
          className={classNames(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition",
            selected || readOnly
              ? "bg-brand-500 text-white"
              : "bg-surface-muted text-foreground-muted group-hover:bg-brand-100 group-hover:text-brand-600"
          )}
          aria-hidden
        >
          <MapPinIcon className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1 pr-6">
          <p className="font-semibold text-foreground">{displayName || "Saved address"}</p>
          <p className="mt-1.5 text-sm leading-relaxed text-foreground-muted">
            {address?.streetAddress}
          </p>
          <p className="text-sm text-foreground-muted">
            {[address?.city, address?.state, address?.zipCode].filter(Boolean).join(", ")}
          </p>
          {address?.mobile ? (
            <p className="mt-2 flex items-center gap-1.5 text-sm text-foreground-subtle">
              <PhoneIcon className="h-4 w-4 shrink-0" />
              {address.mobile}
            </p>
          ) : null}
        </div>
      </div>

      {!readOnly ? (
        <input
          type="radio"
          name={groupName}
          checked={selected}
          readOnly
          tabIndex={-1}
          className="sr-only"
          aria-hidden
        />
      ) : null}
    </>
  );

  if (readOnly) {
    return (
      <div className="rounded-2xl border border-line bg-surface-muted/40 p-4 sm:p-5">
        {content}
      </div>
    );
  }

  return (
    <div
      role="radio"
      aria-checked={selected}
      tabIndex={disabled ? -1 : 0}
      onClick={handleActivate}
      onKeyDown={(e) => {
        if (disabled) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleActivate();
        }
      }}
      className={classNames(
        "group relative rounded-2xl border p-4 text-left transition outline-none sm:p-5",
        disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer",
        selected
          ? "border-brand-500 bg-brand-50/50 shadow-sm ring-2 ring-brand-500/25"
          : "border-line bg-surface hover:border-brand-300 hover:shadow-sm",
        !disabled && "focus-visible:ring-2 focus-visible:ring-brand-500/50"
      )}
    >
      {content}
    </div>
  );
}
