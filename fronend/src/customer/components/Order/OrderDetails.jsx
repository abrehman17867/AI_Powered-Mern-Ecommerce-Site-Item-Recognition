import React, { useEffect, useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeftIcon,
  CreditCardIcon,
  MapPinIcon,
  ShoppingBagIcon,
  TruckIcon,
  ChatBubbleLeftRightIcon,
  DocumentDuplicateIcon,
} from "@heroicons/react/24/outline";
import AddressCard from "../AddressCard/AddressCard";
import OrderTracker from "./OrderTracker";
import OrderDetailLineItem from "./OrderDetailLineItem";
import { OrderStatusBadge, PaymentStatusBadge } from "./OrderStatusBadge";
import { useDispatch, useSelector } from "react-redux";
import { getOrderById } from "../../../State/Order/Action";
import PageLayout from "../../../components/layout/PageLayout";
import Button from "../../../components/ui/Button";
import LoadingState from "../../../components/ui/LoadingState";
import EmptyState from "../../../components/ui/EmptyState";
import {
  estimatedDeliveryDate,
  formatMoney,
  formatOrderDate,
  getOrderStatusMeta,
  getTrackerStep,
  shortOrderId,
} from "../../../utils/orderUtils";

const OrderDetails = () => {
  const { orderId } = useParams();
  const { order, loading, error } = useSelector((state) => state.order);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const isCurrentOrder = order?._id === orderId;
  const initialLoad = loading && !isCurrentOrder;

  useEffect(() => {
    if (orderId) {
      dispatch(getOrderById(orderId));
    }
  }, [dispatch, orderId]);

  const selectedOrder = isCurrentOrder ? order : null;
  const items = selectedOrder?.orderItems || [];
  const itemCount = useMemo(
    () => items.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0),
    [items]
  );

  const paymentPending = selectedOrder?.paymentDetails?.paymentSatus === "PENDING";
  const cancelled = selectedOrder?.orderStatus === "CANCELLED";
  const delivered = selectedOrder?.orderStatus === "DELIVERED";
  const statusMeta = getOrderStatusMeta(selectedOrder?.orderStatus);
  const trackerStep = getTrackerStep(selectedOrder);
  const eta = estimatedDeliveryDate(selectedOrder);

  if (initialLoad) {
    return (
      <PageLayout eyebrow="Order details" title="Loading…">
        <LoadingState minHeight="min-h-[40vh]" label="Loading order details…" />
      </PageLayout>
    );
  }

  if (!selectedOrder && !loading) {
    return (
      <PageLayout eyebrow="Order details" title="Order not found">
        <EmptyState
          title="We couldn't find this order"
          description={error || "It may have been removed or you don't have access."}
          actionLabel="Back to orders"
          onAction={() => navigate("/account/order")}
        />
      </PageLayout>
    );
  }

  const summaryPanel = (
    <div className="space-y-4 px-5 py-5 text-sm sm:px-6">
      <div className="flex flex-wrap gap-2">
        <OrderStatusBadge status={selectedOrder?.orderStatus} />
        <PaymentStatusBadge paymentStatus={selectedOrder?.paymentDetails?.paymentSatus} />
      </div>

      <div className="space-y-3 rounded-xl bg-surface-muted/50 p-4">
        <div className="flex justify-between gap-2">
          <span className="text-foreground-muted">Order ref</span>
          <span className="font-mono text-xs font-semibold">{shortOrderId(orderId)}</span>
        </div>
        <div className="flex justify-between gap-2">
          <span className="text-foreground-muted">Placed on</span>
          <span className="font-medium">{formatOrderDate(selectedOrder?.orderDate)}</span>
        </div>
        {!cancelled ? (
          <div className="flex justify-between gap-2">
            <span className="text-foreground-muted">
              {delivered ? "Delivered" : "Est. delivery"}
            </span>
            <span className="font-medium">
              {formatOrderDate(
                delivered
                  ? selectedOrder?.deliveryDate || selectedOrder?.orderDate
                  : eta
              )}
            </span>
          </div>
        ) : null}
        <div className="flex justify-between gap-2">
          <span className="text-foreground-muted">Items</span>
          <span className="font-medium">{itemCount}</span>
        </div>
      </div>

      <div className="space-y-2 border-t border-line pt-4">
        <div className="flex justify-between gap-4">
          <span className="text-foreground-muted">Subtotal</span>
          <span className="font-medium tabular-nums">{formatMoney(selectedOrder?.totalPrice)}</span>
        </div>
        {selectedOrder?.discounte > 0 ? (
          <div className="flex justify-between gap-4">
            <span className="text-foreground-muted">Savings</span>
            <span className="font-medium tabular-nums text-emerald-600">
              −{formatMoney(selectedOrder?.discounte)}
            </span>
          </div>
        ) : null}
        <div className="flex justify-between gap-4">
          <span className="text-foreground-muted">Delivery</span>
          <span className="font-medium text-emerald-600">Free</span>
        </div>
        <div className="flex justify-between gap-4 border-t border-line pt-3">
          <span className="text-base font-semibold">Order total</span>
          <span className="text-xl font-bold tabular-nums text-brand-600">
            {formatMoney(selectedOrder?.totalDiscountedPrice)}
          </span>
        </div>
      </div>

      {paymentPending ? (
        <Button className="w-full !py-3" onClick={() => navigate(`/checkout?step=3&order_id=${orderId}`)}>
          <CreditCardIcon className="mr-2 h-5 w-5" />
          Complete payment
        </Button>
      ) : null}

      <div className="space-y-2 border-t border-line pt-4 text-xs text-foreground-muted">
        <p className="flex items-center gap-2">
          <TruckIcon className="h-4 w-4 shrink-0 text-brand-500" />
          {statusMeta.description}
        </p>
        <p className="flex items-center gap-2">
          <ChatBubbleLeftRightIcon className="h-4 w-4 shrink-0 text-brand-500" />
          Need help? Contact support with your order ref.
        </p>
      </div>
    </div>
  );

  return (
    <PageLayout
      eyebrow="Order details"
      title={shortOrderId(orderId)}
      description={`Placed ${formatOrderDate(selectedOrder?.orderDate)} · ${itemCount} item${itemCount === 1 ? "" : "s"}`}
      actions={
        <Link
          to="/account/order"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 transition hover:text-brand-700"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          All orders
        </Link>
      }
      className="pb-10"
    >
      <div className="mb-8">
        <OrderTracker activeStep={trackerStep} cancelled={cancelled} />
      </div>

      <div className="grid gap-8 xl:grid-cols-[1fr_min(20rem)] xl:items-start">
        <div className="space-y-6">
          <section className="overflow-hidden rounded-2xl border border-line bg-surface shadow-sm">
            <div className="border-b border-line bg-surface-muted/40 px-5 py-4 sm:px-6">
              <div className="flex items-center gap-2">
                <ShoppingBagIcon className="h-5 w-5 text-brand-500" />
                <div>
                  <h2 className="text-base font-bold text-foreground">Items in this order</h2>
                  <p className="text-xs text-foreground-muted">
                    {items.length} product{items.length === 1 ? "" : "s"}
                  </p>
                </div>
              </div>
            </div>

            {items.length === 0 ? (
              <p className="p-6 text-sm text-foreground-muted">No items in this order.</p>
            ) : (
              <>
                <div className="hidden border-b border-line bg-surface-muted/30 px-6 py-2.5 text-xs font-semibold uppercase tracking-wide text-foreground-muted sm:grid sm:grid-cols-[minmax(0,1fr)_5rem_5rem_auto] sm:gap-6">
                  <span>Product</span>
                  <span className="text-center">Price</span>
                  <span className="text-right">Total</span>
                  <span className="sr-only">Actions</span>
                </div>
                {items.map((item) => (
                  <OrderDetailLineItem
                    key={item._id}
                    item={item}
                    showReview={delivered}
                  />
                ))}
              </>
            )}
          </section>

          <section className="overflow-hidden rounded-2xl border border-line bg-surface shadow-sm">
            <div className="border-b border-line bg-surface-muted/40 px-5 py-4 sm:px-6">
              <div className="flex items-center gap-2">
                <MapPinIcon className="h-5 w-5 text-brand-500" />
                <div>
                  <h2 className="text-base font-bold text-foreground">Delivery address</h2>
                  <p className="text-xs text-foreground-muted">Where this order is shipping</p>
                </div>
              </div>
            </div>
            <div className="p-5 sm:p-6">
              {selectedOrder?.shippingAddress ? (
                <AddressCard address={selectedOrder.shippingAddress} readOnly />
              ) : (
                <p className="text-sm text-foreground-muted">No shipping address on file.</p>
              )}
            </div>
          </section>

          {selectedOrder?.paymentDetails?.transactionId ? (
            <section className="overflow-hidden rounded-2xl border border-line bg-surface shadow-sm">
              <div className="border-b border-line bg-surface-muted/40 px-5 py-4 sm:px-6">
                <div className="flex items-center gap-2">
                  <DocumentDuplicateIcon className="h-5 w-5 text-brand-500" />
                  <h2 className="text-base font-bold text-foreground">Payment receipt</h2>
                </div>
              </div>
              <div className="space-y-2 px-5 py-5 text-sm sm:px-6">
                <div className="flex justify-between gap-4">
                  <span className="text-foreground-muted">Method</span>
                  <span className="font-medium capitalize">
                    {selectedOrder.paymentDetails.paymentMethod || "Card"}
                  </span>
                </div>
                {selectedOrder.paymentDetails.paymentId ? (
                  <div className="flex justify-between gap-4">
                    <span className="text-foreground-muted">Payment ID</span>
                    <span className="max-w-[12rem] truncate font-mono text-xs">
                      {selectedOrder.paymentDetails.paymentId}
                    </span>
                  </div>
                ) : null}
              </div>
            </section>
          ) : null}
        </div>

        <aside className="xl:sticky xl:top-28">
          <div className="overflow-hidden rounded-2xl border border-line bg-gradient-to-br from-surface via-surface to-brand-50/40 shadow-sm">
            <div className="border-b border-line px-6 py-5">
              <h2 className="text-lg font-bold text-foreground">Order summary</h2>
              <p className="mt-1 text-sm text-foreground-muted">Receipt and status</p>
            </div>
            {summaryPanel}
          </div>
        </aside>
      </div>
    </PageLayout>
  );
};

export default OrderDetails;
