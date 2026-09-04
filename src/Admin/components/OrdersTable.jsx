"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  confirmOrder,
  deleteOrder,
  deliveredOrder,
  getOrders,
  shipOrder,
} from "../../State/Admin/Order/Action";
import AdminCard from "./ui/AdminCard";
import AdminPageHeader from "./ui/AdminPageHeader";
import ConfirmDialog from "./ui/ConfirmDialog";
import TableWrapper from "../../components/ui/TableWrapper";
import InlineLoadingBar from "../../components/ui/InlineLoadingBar";
import { TableSkeleton } from "../../components/ui/Skeleton";
import Select from "../../components/ui/Select";
import { adminToast } from "../../utils/adminToast";
import { classNames } from "../../utils/classNames";

const STATUS_OPTIONS = [
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "SHIPPED", label: "Shipped" },
  { value: "DELIVERED", label: "Delivered" },
];

const COLUMN_COUNT = 7;

const statusTone = (status) => {
  if (status === "CONFIRMED") return "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200/80";
  if (status === "SHIPPED") return "bg-sky-100 text-sky-800 ring-1 ring-sky-200/80";
  if (status === "PLACED") return "bg-amber-100 text-amber-800 ring-1 ring-amber-200/80";
  if (status === "PENDING") return "bg-surface-muted text-foreground-muted ring-1 ring-line";
  return "bg-brand-100 text-brand-800 ring-1 ring-brand-200/80";
};

const OrdersTable = () => {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const [search, setSearch] = useState("");

  const dispatch = useDispatch();
  const { orders, loading, refreshing, mutatingOrderId, error } = useSelector(
    (store) => store.adminOrder
  );

  // Fetch once on mount. Status changes and deletes patch the store directly,
  // so there is nothing here for them to re-trigger — that dependency list is
  // what used to wipe the table to a "Loading orders…" message after every
  // action, twice over.
  useEffect(() => {
    dispatch(getOrders()).catch(() => {});
  }, [dispatch]);

  const deleting = pendingDeleteId != null && mutatingOrderId === pendingDeleteId;
  const busyAnywhere = Boolean(mutatingOrderId);

  const mutationError = (err) =>
    err?.response?.data?.error ||
    err?.response?.data?.message ||
    err?.message ||
    "Something went wrong.";

  const runStatusChange = (orderId, action, successMessage) => {
    dispatch(action(orderId))
      .then(() => adminToast.success(successMessage))
      .catch((err) => adminToast.error(mutationError(err)));
  };

  const handleStatusChange = (orderId, currentStatus, nextStatus) => {
    const current = String(currentStatus || "").toUpperCase();
    const next = String(nextStatus || "").toUpperCase();
    if (!next || next === current || busyAnywhere) return;

    if (next === "CONFIRMED") runStatusChange(orderId, confirmOrder, "Order marked as confirmed.");
    else if (next === "SHIPPED") runStatusChange(orderId, shipOrder, "Order marked as shipped.");
    else if (next === "DELIVERED")
      runStatusChange(orderId, deliveredOrder, "Order marked as delivered.");
  };

  const openDeleteConfirm = (orderId) => {
    setPendingDeleteId(orderId);
    setConfirmOpen(true);
  };

  const runDeleteOrder = () => {
    if (!pendingDeleteId) return;
    dispatch(deleteOrder(pendingDeleteId))
      .then(() => {
        adminToast.success("Order deleted.");
        setConfirmOpen(false);
        setPendingDeleteId(null);
      })
      .catch((err) => adminToast.error(mutationError(err)));
  };

  const rows = useMemo(() => {
    const all = orders || [];
    if (!search.trim()) return all;
    const q = search.toLowerCase();
    return all.filter(
      (item) =>
        String(item._id || "").toLowerCase().includes(q) ||
        String(item.orderStatus || "").toLowerCase().includes(q)
    );
  }, [orders, search]);

  const statusOptionsFor = (currentStatus) => {
    const current = String(currentStatus || "").toUpperCase();
    return STATUS_OPTIONS.map((opt) => ({ ...opt, disabled: opt.value === current }));
  };

  const statusValueFor = (currentStatus) => {
    const current = String(currentStatus || "").toUpperCase();
    return STATUS_OPTIONS.some((o) => o.value === current) ? current : "";
  };

  return (
    <div className="space-y-4">
      <ConfirmDialog
        open={confirmOpen}
        onClose={() => {
          if (!deleting) {
            setConfirmOpen(false);
            setPendingDeleteId(null);
          }
        }}
        onConfirm={runDeleteOrder}
        title="Delete order?"
        description="This permanently removes the order from admin history. Use only for test or mistaken entries."
        confirmLabel="Delete order"
        cancelLabel="Cancel"
        loading={deleting}
        danger
      />
      <AdminPageHeader
        title="Orders"
        subtitle="Track order lifecycle and fulfillment progress."
      />
      <AdminCard noPadding>
        <div className="border-b border-line/60 px-4 py-4 sm:px-6">
          <input
            className="ui-input sm:max-w-xs"
            placeholder="Search orders…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <InlineLoadingBar active={refreshing} label="Refreshing orders" />

        {error && !loading && (orders?.length || 0) === 0 ? (
          <div className="px-4 py-12 text-center text-sm text-rose-600 sm:px-6">{error}</div>
        ) : (
          <TableWrapper className="rounded-none border-0 shadow-none">
            <table className="w-full min-w-[54rem] text-sm">
              <thead className="admin-table-head">
                <tr>
                  {/* Widths are pinned so a status change cannot reflow the
                      table. Only "Items" is elastic. */}
                  <th className="w-12 px-3 py-3">#</th>
                  <th className="px-3 py-3">Items</th>
                  <th className="w-[11rem] px-3 py-3">Order Id</th>
                  <th className="w-[6rem] px-3 py-3">Total</th>
                  <th className="w-[9.5rem] px-3 py-3">Status</th>
                  <th className="w-[11rem] px-3 py-3">Update</th>
                  <th className="w-[6.5rem] px-3 py-3 text-right">Delete</th>
                </tr>
              </thead>
              {loading ? (
                <TableSkeleton rows={6} columns={COLUMN_COUNT} />
              ) : (
                <tbody className="divide-y divide-line bg-surface">
                  {rows.map((item, index) => {
                    const busy = mutatingOrderId === item._id;
                    return (
                      <tr
                        key={item._id}
                        className={classNames(
                          "transition hover:bg-surface-muted/60",
                          busy && "bg-brand-50/40"
                        )}
                        aria-busy={busy || undefined}
                      >
                        <td className="px-3 py-3 text-zinc-600">{index + 1}</td>
                        <td className="px-3 py-3">
                          <div className="space-y-1">
                            {(item?.orderItems || []).slice(0, 2).map((orderItem) => (
                              <p key={orderItem._id} className="text-xs text-zinc-600">
                                {orderItem?.product?.title}
                              </p>
                            ))}
                            {(item?.orderItems || []).length > 2 ? (
                              <p className="text-xs text-zinc-400">
                                +{item.orderItems.length - 2} more
                              </p>
                            ) : null}
                          </div>
                        </td>
                        <td className="break-all px-3 py-3 font-mono text-[11px] text-zinc-500">
                          {item._id}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 font-medium text-zinc-900">
                          ${item.totalPrice}
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={classNames(
                                "inline-flex min-w-[6.25rem] justify-center whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold",
                                statusTone(item.orderStatus)
                              )}
                            >
                              {item.orderStatus}
                            </span>
                            <span
                              aria-hidden="true"
                              className={classNames(
                                "h-3 w-3 shrink-0 rounded-full border-2 border-brand-500 border-t-transparent",
                                busy ? "animate-spin" : "invisible"
                              )}
                            />
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <Select
                            compact
                            className="w-[9.5rem]"
                            id={`order-status-${item._id}`}
                            value={statusValueFor(item.orderStatus)}
                            onChange={(next) =>
                              handleStatusChange(item._id, item.orderStatus, next)
                            }
                            options={statusOptionsFor(item.orderStatus)}
                            placeholder="Update status…"
                            disabled={busyAnywhere}
                          />
                        </td>
                        <td className="px-3 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => openDeleteConfirm(item._id)}
                            disabled={busyAnywhere}
                            className="whitespace-nowrap rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-xs font-semibold text-rose-600 shadow-sm transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {rows.length === 0 && (
                    <tr>
                      <td
                        colSpan={COLUMN_COUNT}
                        className="px-3 py-8 text-center text-sm text-zinc-500"
                      >
                        No orders found.
                      </td>
                    </tr>
                  )}
                </tbody>
              )}
            </table>
          </TableWrapper>
        )}
      </AdminCard>
    </div>
  );
};

export default OrdersTable;
