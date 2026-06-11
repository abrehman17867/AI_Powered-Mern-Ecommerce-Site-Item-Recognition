import React, { useMemo } from "react";
import {
  ArrowRightIcon,
  CalendarDaysIcon,
  TruckIcon,
} from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import {
  estimatedDeliveryDate,
  formatMoney,
  formatOrderDate,
  getOrderStatusMeta,
  shortOrderId,
} from "../../../utils/orderUtils";
import { OrderStatusBadge, PaymentStatusBadge } from "./OrderStatusBadge";
import { classNames } from "../../../utils/classNames";

const MAX_THUMBS = 4;

export default function OrderCard({ order }) {
  const navigate = useNavigate();
  const items = order?.orderItems || [];
  const itemCount = useMemo(
    () => items.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0),
    [items]
  );
  const statusMeta = getOrderStatusMeta(order?.orderStatus);
  const paymentPending = order?.paymentDetails?.paymentSatus === "PENDING";
  const eta = estimatedDeliveryDate(order);
  const visibleItems = items.slice(0, MAX_THUMBS);
  const overflow = items.length - MAX_THUMBS;

  const goToDetails = () => navigate(`/account/order/${order?._id}`);

  return (
    <article
      className="group overflow-hidden rounded-2xl border border-line bg-surface shadow-sm transition hover:border-brand-200 hover:shadow-md"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-surface-muted/40 px-5 py-4 sm:px-6">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <p className="text-xs font-medium text-foreground-muted">Order</p>
            <p className="font-mono text-sm font-bold text-foreground">
              {shortOrderId(order?._id)}
            </p>
          </div>
          <span className="hidden h-8 w-px bg-line sm:block" aria-hidden />
          <div className="flex items-center gap-1.5 text-sm text-foreground-muted">
            <CalendarDaysIcon className="h-4 w-4 shrink-0" />
            {formatOrderDate(order?.orderDate)}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <PaymentStatusBadge paymentStatus={order?.paymentDetails?.paymentSatus} />
          <OrderStatusBadge status={order?.orderStatus} />
        </div>
      </div>

      <button
        type="button"
        onClick={goToDetails}
        className="flex w-full flex-col gap-4 px-5 py-5 text-left transition hover:bg-surface-muted/30 sm:px-6"
      >
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex -space-x-2">
            {visibleItems.map((item) => (
              <span
                key={item._id}
                className="relative inline-flex h-14 w-14 overflow-hidden rounded-xl border-2 border-white bg-surface-muted shadow-sm"
              >
                <img
                  src={item?.product?.imageUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </span>
            ))}
            {overflow > 0 ? (
              <span className="relative inline-flex h-14 w-14 items-center justify-center rounded-xl border-2 border-white bg-surface-muted text-xs font-bold text-foreground-muted">
                +{overflow}
              </span>
            ) : null}
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-foreground">
              {itemCount} item{itemCount === 1 ? "" : "s"}
              {items.length === 1 && items[0]?.product?.title
                ? ` · ${items[0].product.title}`
                : null}
            </p>
            <p className="mt-0.5 text-xs text-foreground-muted">{statusMeta.description}</p>
          </div>

          <p className="text-lg font-bold tabular-nums text-foreground">
            {formatMoney(order?.totalDiscountedPrice)}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
          <div className="flex items-center gap-2 text-xs text-foreground-muted">
            <TruckIcon className="h-4 w-4 shrink-0 text-brand-500" />
            {order?.orderStatus === "DELIVERED" ? (
              <span>Delivered {formatOrderDate(order?.deliveryDate || order?.orderDate)}</span>
            ) : paymentPending ? (
              <span className="text-amber-700">Complete payment to confirm delivery</span>
            ) : (
              <span>Est. delivery {formatOrderDate(eta)}</span>
            )}
          </div>

          <span
            className={classNames(
              "inline-flex items-center gap-1 text-sm font-semibold text-brand-600",
              "transition group-hover:gap-2"
            )}
          >
            View details
            <ArrowRightIcon className="h-4 w-4" />
          </span>
        </div>
      </button>

      {paymentPending ? (
        <div className="border-t border-line bg-amber-50/50 px-5 py-3 sm:px-6">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/checkout?step=3&order_id=${order._id}`);
            }}
            className="text-sm font-semibold text-brand-600 hover:text-brand-700"
          >
            Complete payment →
          </button>
        </div>
      ) : null}
    </article>
  );
}
