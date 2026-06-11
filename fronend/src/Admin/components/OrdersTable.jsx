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
import Select from "../../components/ui/Select";
import { adminToast } from "../../utils/adminToast";

const STATUS_OPTIONS = [
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "SHIPPED", label: "Shipped" },
  { value: "DELIVERED", label: "Delivered" },
];

const OrdersTable = () => {
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const [search, setSearch] = useState("");

  const dispatch = useDispatch();
  const { adminOrder } = useSelector((store) => store);

  const loading = adminOrder.loading || deleteBusy;

  useEffect(() => {
    dispatch(getOrders());
  }, [
    dispatch,
    adminOrder.confirmed,
    adminOrder.shipped,
    adminOrder.delivered,
    adminOrder.deletedOrder,
  ]);

  const orderErr = (err) =>
    err?.response?.data?.message ||
    err?.response?.data?.error ||
    err?.message ||
    "Something went wrong.";

  const handleShippedOrder = (orderId) => {
    dispatch(shipOrder(orderId))
      .then(() => adminToast.success("Order marked as shipped."))
      .catch((err) => adminToast.error(orderErr(err)));
  };

  const handleConfirmedOrder = (orderId) => {
    dispatch(confirmOrder(orderId))
      .then(() => adminToast.success("Order marked as confirmed."))
      .catch((err) => adminToast.error(orderErr(err)));
  };

  const handleDeliveredOrder = (orderId) => {
    dispatch(deliveredOrder(orderId))
      .then(() => adminToast.success("Order marked as delivered."))
      .catch((err) => adminToast.error(orderErr(err)));
  };

  const handleStatusChange = (orderId, currentStatus, nextStatus) => {
    const current = String(currentStatus || "").toUpperCase();
    const next = String(nextStatus || "").toUpperCase();
    if (!next || next === current) return;

    if (next === "CONFIRMED") handleConfirmedOrder(orderId);
    else if (next === "SHIPPED") handleShippedOrder(orderId);
    else if (next === "DELIVERED") handleDeliveredOrder(orderId);
  };

  const openDeleteConfirm = (orderId) => {
    setPendingDeleteId(orderId);
    setConfirmOpen(true);
  };

  const runDeleteOrder = () => {
    if (!pendingDeleteId) return;
    setDeleteBusy(true);
    dispatch(deleteOrder(pendingDeleteId))
      .then(() => {
        adminToast.success("Order deleted.");
        setConfirmOpen(false);
        setPendingDeleteId(null);
      })
      .catch((err) => {
        adminToast.error(orderErr(err));
      })
      .finally(() => setDeleteBusy(false));
  };

  const rows = useMemo(() => {
    const all = adminOrder?.orders || [];
    if (!search.trim()) return all;
    const q = search.toLowerCase();
    return all.filter(
      (item) =>
        String(item._id || "").toLowerCase().includes(q) ||
        String(item.orderStatus || "").toLowerCase().includes(q)
    );
  }, [adminOrder?.orders, search]);

  const statusTone = (status) => {
    if (status === "CONFIRMED") return "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200/80";
    if (status === "SHIPPED") return "bg-sky-100 text-sky-800 ring-1 ring-sky-200/80";
    if (status === "PLACED") return "bg-amber-100 text-amber-800 ring-1 ring-amber-200/80";
    if (status === "PENDING") return "bg-surface-muted text-foreground-muted ring-1 ring-line";
    return "bg-brand-100 text-brand-800 ring-1 ring-brand-200/80";
  };

  const statusOptionsFor = (currentStatus) => {
    const current = String(currentStatus || "").toUpperCase();
    return STATUS_OPTIONS.map((opt) => ({
      ...opt,
      disabled: opt.value === current,
    }));
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
          if (!deleteBusy) {
            setConfirmOpen(false);
            setPendingDeleteId(null);
          }
        }}
        onConfirm={runDeleteOrder}
        title="Delete order?"
        description="This permanently removes the order from admin history. Use only for test or mistaken entries."
        confirmLabel="Delete order"
        cancelLabel="Cancel"
        loading={deleteBusy}
        danger
      />
      <AdminPageHeader
        title="Orders"
        subtitle="Track order lifecycle and fulfillment progress."
      />
      <AdminCard noPadding>
        <div className="border-b border-line/60 px-5 py-4 sm:px-6">
          <input
            className="ui-input sm:max-w-xs"
            placeholder="Search orders…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {loading ? (
          <div className="py-12 text-center text-sm text-foreground-muted">Loading orders…</div>
        ) : (
          <TableWrapper className="border-0 shadow-none rounded-none">
            <table className="min-w-full text-sm">
              <thead className="admin-table-head">
                <tr>
                  <th className="px-3 py-3">#</th>
                  <th className="px-3 py-3">Items</th>
                  <th className="px-3 py-3">Order Id</th>
                  <th className="px-3 py-3">Total</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3">Update</th>
                  <th className="px-3 py-3 text-right">Delete</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line bg-surface">
                {rows.map((item, index) => (
                  <tr
                    key={item._id}
                    className="transition hover:bg-surface-muted/60"
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
                    <td className="px-3 py-3 font-mono text-[11px] text-zinc-500">{item._id}</td>
                    <td className="px-3 py-3 font-medium text-zinc-900">${item.totalPrice}</td>
                    <td className="px-3 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusTone(
                          item.orderStatus
                        )}`}
                      >
                        {item.orderStatus}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <Select
                        compact
                        className="w-[9.5rem]"
                        id={`order-status-${item._id}`}
                        value={statusValueFor(item.orderStatus)}
                        onChange={(next) => handleStatusChange(item._id, item.orderStatus, next)}
                        options={statusOptionsFor(item.orderStatus)}
                        placeholder="Update status…"
                      />
                    </td>
                    <td className="px-3 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => openDeleteConfirm(item._id)}
                        className="rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-xs font-semibold text-rose-600 shadow-sm transition hover:bg-rose-50"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-3 py-8 text-center text-sm text-zinc-500">
                      No orders found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </TableWrapper>
        )}
      </AdminCard>
    </div>
  );
};

export default OrdersTable;
