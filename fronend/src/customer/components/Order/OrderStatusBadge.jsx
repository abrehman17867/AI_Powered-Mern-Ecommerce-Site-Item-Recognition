import React from "react";
import { classNames } from "../../../utils/classNames";
import { getOrderStatusMeta, getPaymentMeta, toneClasses } from "../../../utils/orderUtils";

export function OrderStatusBadge({ status, className }) {
  const meta = getOrderStatusMeta(status);
  return (
    <span
      className={classNames(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset",
        toneClasses[meta.tone],
        className
      )}
    >
      {meta.label}
    </span>
  );
}

export function PaymentStatusBadge({ paymentStatus, className }) {
  const meta = getPaymentMeta(paymentStatus);
  return (
    <span
      className={classNames(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset",
        toneClasses[meta.tone],
        className
      )}
    >
      {meta.label}
    </span>
  );
}
