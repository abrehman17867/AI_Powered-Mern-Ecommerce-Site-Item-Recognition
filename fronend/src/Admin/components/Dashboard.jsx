import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowPathIcon,
  BanknotesIcon,
  CubeIcon,
  ShoppingBagIcon,
  ShoppingCartIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import { api } from "../../config/apiConfig";
import AdminCard from "./ui/AdminCard";
import AdminKpiCard from "./ui/AdminKpiCard";
import SalesAreaChart from "./charts/SalesAreaChart";
import OrderStatusDonut from "./charts/OrderStatusDonut";
import { adminToast } from "../../utils/adminToast";
import { classNames } from "../../utils/classNames";
import {
  bucketOrders,
  money,
  periodTrend,
  statusMeta,
  TONE_BADGE,
} from "../utils/dashboardMetrics";

const REFRESH_MS = 60000;
const LOW_STOCK = 10;

const AdminDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async (toast = false) => {
    try {
      const [pr, ur, or] = await Promise.all([
        api.get("/api/products?pageNumber=1&pageSize=1000"),
        api.get("/api/users"),
        api.get("/api/admin/orders"),
      ]);
      setProducts(pr?.data?.content || []);
      setUsers(ur.data || []);
      setOrders(or.data || []);
      if (toast) adminToast.success("Dashboard refreshed");
    } catch (e) {
      adminToast.error(e?.response?.data?.message || e?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, REFRESH_MS);
    return () => clearInterval(t);
  }, [load]);

  const buckets = useMemo(() => bucketOrders(orders, 14), [orders]);
  const trend = useMemo(() => periodTrend(buckets, 7), [buckets]);

  const sparkRevenue = useMemo(() => buckets.slice(-7).map((b) => b.revenue), [buckets]);
  const sparkOrders = useMemo(() => buckets.slice(-7).map((b) => b.count), [buckets]);

  const stats = useMemo(() => {
    const revenue = orders.reduce(
      (s, o) => s + (Number(o.totalDiscountedPrice ?? o.totalPrice) || 0),
      0
    );
    const pending = orders.filter(
      (o) =>
        String(o.orderStatus).toUpperCase() === "PENDING" ||
        o.paymentDetails?.paymentSatus === "PENDING"
    ).length;
    return {
      revenue,
      orders: orders.length,
      products: products.length,
      customers: users.filter((u) => u.role !== "ADMIN").length,
      pending,
      weekOrders: buckets.slice(-7).reduce((s, b) => s + b.count, 0),
      weekRevenue: buckets.slice(-7).reduce((s, b) => s + b.revenue, 0),
    };
  }, [orders, products, users, buckets]);

  const recent = useMemo(
    () =>
      [...orders]
        .sort((a, b) => new Date(b.orderDate || b.createAt) - new Date(a.orderDate || a.createAt))
        .slice(0, 6),
    [orders]
  );

  const lowStock = useMemo(
    () =>
      products
        .filter((p) => Number(p.quantity) <= LOW_STOCK)
        .sort((a, b) => Number(a.quantity) - Number(b.quantity))
        .slice(0, 4),
    [products]
  );

  const statusCounts = useMemo(() => {
    const m = new Map();
    orders.forEach((o) => m.set(o.orderStatus || "PENDING", (m.get(o.orderStatus) || 0) + 1));
    return [...m.entries()].map(([label, value]) => ({ label, value }));
  }, [orders]);

  const dateStr = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-foreground-muted">{dateStr}</p>
        <button
          type="button"
          disabled={busy}
          onClick={() => {
            setBusy(true);
            load(true);
          }}
          className="inline-flex items-center justify-center gap-2 self-start rounded-lg border border-line bg-white px-4 py-2 text-sm font-medium text-foreground shadow-sm transition hover:bg-zinc-50 disabled:opacity-60"
        >
          <ArrowPathIcon className={classNames("h-4 w-4", busy && "animate-spin")} />
          Refresh data
        </button>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <AdminKpiCard
          label="Total revenue"
          value={money(stats.revenue)}
          sub={`${money(stats.weekRevenue)} this week`}
          icon={BanknotesIcon}
          trend={trend}
          sparkData={sparkRevenue}
          accent="brand"
          loading={loading}
        />
        <AdminKpiCard
          label="Orders"
          value={loading ? "—" : stats.orders}
          sub={`${stats.weekOrders} orders this week`}
          icon={ShoppingCartIcon}
          sparkData={sparkOrders}
          accent="emerald"
          loading={loading}
        />
        <AdminKpiCard
          label="Products"
          value={loading ? "—" : stats.products}
          sub="In catalog"
          icon={CubeIcon}
          accent="violet"
          loading={loading}
        />
        <AdminKpiCard
          label="Customers"
          value={loading ? "—" : stats.customers}
          sub="Registered accounts"
          icon={UsersIcon}
          accent="sky"
          loading={loading}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <AdminCard
          className="xl:col-span-2"
          title="Sales performance"
          subtitle="Revenue over the last 14 days"
          action={
            <span className="rounded-lg bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700">
              {money(buckets.reduce((s, b) => s + b.revenue, 0))} total
            </span>
          }
        >
          {loading ? (
            <div className="h-[220px] animate-pulse rounded-xl bg-zinc-100" />
          ) : (
            <SalesAreaChart points={buckets} />
          )}
        </AdminCard>

        <AdminCard title="Order status" subtitle="Fulfillment breakdown">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="h-36 w-36 animate-pulse rounded-full bg-zinc-100" />
            </div>
          ) : statusCounts.length ? (
            <OrderStatusDonut items={statusCounts} total={stats.orders} />
          ) : (
            <p className="py-12 text-center text-sm text-foreground-muted">No orders yet</p>
          )}
        </AdminCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <AdminCard
          className="lg:col-span-3"
          title="Recent orders"
          action={
            <Link to="/admin/orders" className="text-xs font-semibold text-brand-600 hover:text-brand-700">
              View all →
            </Link>
          }
          noPadding
        >
          {loading ? (
            <div className="h-40 animate-pulse bg-zinc-50" />
          ) : recent.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[32rem] text-sm">
                <thead>
                  <tr className="border-b border-line/60 bg-zinc-50/80 text-left text-xs font-medium uppercase tracking-wide text-foreground-muted">
                    <th className="px-6 py-3">Order</th>
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3">Amount</th>
                    <th className="px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line/60">
                  {recent.map((o) => {
                    const meta = statusMeta(o.orderStatus);
                    return (
                      <tr key={o._id} className="transition hover:bg-zinc-50/80">
                        <td className="px-6 py-3.5 font-mono text-xs text-foreground-muted">
                          #{String(o._id).slice(-8).toUpperCase()}
                        </td>
                        <td className="px-6 py-3.5 text-foreground-muted">
                          {new Date(o.orderDate || o.createAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-3.5 font-semibold tabular-nums">
                          {money(o.totalDiscountedPrice ?? o.totalPrice)}
                        </td>
                        <td className="px-6 py-3.5">
                          <span
                            className={classNames(
                              "inline-flex rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset",
                              TONE_BADGE[meta.tone]
                            )}
                          >
                            {meta.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="px-6 py-12 text-center text-sm text-foreground-muted">No orders yet</p>
          )}
        </AdminCard>

        <div className="flex flex-col gap-6 lg:col-span-2">
          <AdminCard title="Action center" subtitle="Items needing review">
            <div className="space-y-3">
              <Link
                to="/admin/orders"
                className="flex items-center justify-between rounded-xl border border-line/80 bg-gradient-to-r from-white to-zinc-50/80 px-4 py-3.5 transition hover:border-brand-200 hover:shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-500/10">
                    <ShoppingBagIcon className="h-5 w-5 text-brand-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Pending orders</p>
                    <p className="text-xs text-foreground-muted">Payment or processing</p>
                  </div>
                </div>
                <span className="text-xl font-bold tabular-nums text-brand-600">
                  {loading ? "—" : stats.pending}
                </span>
              </Link>
              <Link
                to="/admin/products"
                className="flex items-center justify-between rounded-xl border border-line/80 bg-gradient-to-r from-white to-zinc-50/80 px-4 py-3.5 transition hover:border-amber-200 hover:shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
                    <CubeIcon className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Low inventory</p>
                    <p className="text-xs text-foreground-muted">≤ {LOW_STOCK} units</p>
                  </div>
                </div>
                <span className="text-xl font-bold tabular-nums">{loading ? "—" : lowStock.length}</span>
              </Link>
            </div>
          </AdminCard>

          {lowStock.length > 0 ? (
            <AdminCard title="Restock soon" noPadding>
              <ul className="divide-y divide-line/60">
                {lowStock.map((p) => (
                  <li key={p._id} className="flex items-center gap-3 px-6 py-3.5">
                    <img src={p.imageUrl} alt="" className="h-10 w-10 rounded-lg object-cover ring-1 ring-line" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{p.title}</p>
                      <p className="text-xs text-foreground-muted">{p.quantity} left</p>
                    </div>
                    <Link
                      to={`/admin/products/${p._id}/edit`}
                      className="text-xs font-semibold text-brand-600 hover:text-brand-700"
                    >
                      Edit
                    </Link>
                  </li>
                ))}
              </ul>
            </AdminCard>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
