"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  MagnifyingGlassIcon,
  ShoppingBagIcon,
} from "@heroicons/react/24/outline";
import OrderCard from "./OrderCard";
import { Link, useNavigate } from "@/lib/navigation";
import { useDispatch, useSelector } from "react-redux";
import { getOrderHistory } from "../../../State/Order/Action";
import PageLayout from "../../../components/layout/PageLayout";
import LoadingState from "../../../components/ui/LoadingState";
import EmptyState from "../../../components/ui/EmptyState";
import { classNames } from "../../../utils/classNames";
import { STATUS_FILTERS } from "../../../utils/orderUtils";

const Order = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { orders, loading, error } = useSelector((state) => state.order);
  const initialLoad = loading && (!orders || orders.length === 0);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    dispatch(getOrderHistory());
  }, [dispatch]);

  const statusCounts = useMemo(() => {
    const counts = { all: orders?.length || 0 };
    (orders || []).forEach((order) => {
      const key = String(order.orderStatus || "PENDING").toUpperCase();
      counts[key] = (counts[key] || 0) + 1;
    });
    return counts;
  }, [orders]);

  const filteredOrders = useMemo(() => {
    let list = orders || [];
    if (statusFilter !== "all") {
      list = list.filter(
        (order) => String(order.orderStatus || "").toUpperCase() === statusFilter
      );
    }
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter((order) => {
      const ref = String(order._id || "").toLowerCase();
      const titles = (order.orderItems || [])
        .map((item) => item?.product?.title?.toLowerCase() || "")
        .join(" ");
      return ref.includes(q) || titles.includes(q);
    });
  }, [orders, statusFilter, search]);

  return (
    <PageLayout
      eyebrow="Account"
      title="Your orders"
      description="Track deliveries, view receipts, and manage your purchases."
      actions={
        <Link
          to="/products"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 transition hover:text-brand-700"
        >
          <ShoppingBagIcon className="h-4 w-4" />
          Continue shopping
        </Link>
      }
    >
      {!initialLoad && !error && orders?.length > 0 ? (
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Total orders", value: statusCounts.all, tone: "brand" },
            {
              label: "In progress",
              value: (statusCounts.PENDING || 0) + (statusCounts.CONFIRMED || 0),
              tone: "amber",
            },
            { label: "Shipped", value: statusCounts.SHIPPED || 0, tone: "sky" },
            { label: "Delivered", value: statusCounts.DELIVERED || 0, tone: "emerald" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-line bg-gradient-to-br from-surface to-brand-50/20 px-5 py-4 shadow-sm"
            >
              <p className="text-xs font-medium text-foreground-muted">{stat.label}</p>
              <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">{stat.value}</p>
            </div>
          ))}
        </div>
      ) : null}

      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map((option) => {
            const count =
              option.value === "all"
                ? statusCounts.all
                : statusCounts[option.value] || 0;
            const active = statusFilter === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setStatusFilter(option.value)}
                className={classNames(
                  "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition",
                  active
                    ? "bg-brand-600 text-white shadow-sm"
                    : "border border-line bg-surface text-foreground-muted hover:border-brand-200 hover:text-foreground"
                )}
              >
                {option.label}
                {count > 0 ? (
                  <span
                    className={classNames(
                      "rounded-full px-1.5 py-0.5 text-xs tabular-nums",
                      active ? "bg-white/20" : "bg-surface-muted"
                    )}
                  >
                    {count}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>

        <div className="relative w-full lg:max-w-xs">
          <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order or product…"
            className="w-full rounded-xl border border-line bg-surface py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-foreground-muted focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </div>
      </div>

      {initialLoad ? (
        <LoadingState minHeight="min-h-[30vh]" label="Loading your orders…" />
      ) : error ? (
        <EmptyState
          title="Could not load orders"
          description={error}
          actionLabel="Try again"
          onAction={() => dispatch(getOrderHistory())}
        />
      ) : filteredOrders?.length ? (
        <div className="space-y-5">
          {filteredOrders.map((order) => (
            <OrderCard key={order._id} order={order} />
          ))}
        </div>
      ) : orders?.length ? (
        <EmptyState
          title="No matching orders"
          description="Try a different filter or search term."
          actionLabel="Clear filters"
          onAction={() => {
            setStatusFilter("all");
            setSearch("");
          }}
        />
      ) : (
        <EmptyState
          title="No orders yet"
          description="When you place an order, it will show up here with tracking and receipts."
          actionLabel="Start shopping"
          onAction={() => navigate("/products")}
        />
      )}
    </PageLayout>
  );
};

export default Order;
