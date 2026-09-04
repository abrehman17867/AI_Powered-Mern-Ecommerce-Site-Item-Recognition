"use client";

import React, { useEffect, useMemo, useState } from "react";
import { deleteProduct, findProducts } from "../../State/Product/Action";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "@/lib/navigation";
import Button from "../../components/ui/Button";
import AdminPageHeader from "./ui/AdminPageHeader";
import AdminCard from "./ui/AdminCard";
import ConfirmDialog from "./ui/ConfirmDialog";
import TableWrapper from "../../components/ui/TableWrapper";
import InlineLoadingBar from "../../components/ui/InlineLoadingBar";
import { TableSkeleton } from "../../components/ui/Skeleton";
import { adminToast } from "../../utils/adminToast";
import { classNames } from "../../utils/classNames";

const PAGE_SIZE = 9;
const COLUMN_COUNT = 8;

const ProductsTable = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { products, loading, refreshing, deletingProductId, error } = useSelector(
    (store) => store.products
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const [search, setSearch] = useState("");

  // Only the page number drives a refetch. Deleting patches the store, so it
  // no longer re-runs this effect and blanks the table behind a
  // "Loading products…" message.
  useEffect(() => {
    dispatch(
      findProducts({
        category: "",
        colors: [],
        sizes: [],
        minPrice: 0,
        maxPrice: 100000,
        minDiscount: 0,
        sort: "price_low",
        pageNumber: currentPage,
        pageSize: PAGE_SIZE,
        stock: "",
      })
    );
  }, [currentPage, dispatch]);

  const totalPages = products?.totalPages || 1;
  const deleting = pendingDeleteId != null && deletingProductId === pendingDeleteId;

  const openDeleteConfirm = (productId) => {
    setPendingDeleteId(productId);
    setConfirmOpen(true);
  };

  const runProductDelete = () => {
    if (!pendingDeleteId) return;
    dispatch(deleteProduct(pendingDeleteId))
      .then(() => {
        adminToast.success("Product deleted.");
        setConfirmOpen(false);
        setPendingDeleteId(null);
      })
      .catch((err) => {
        adminToast.error(
          err?.response?.data?.message ||
            err?.response?.data?.error ||
            err?.message ||
            "Could not delete this product."
        );
      });
  };

  const rows = useMemo(() => {
    const all = products?.content || [];
    if (!search.trim()) return all;
    const q = search.toLowerCase();
    return all.filter(
      (item) =>
        String(item.title || "").toLowerCase().includes(q) ||
        String(item.brand || "").toLowerCase().includes(q) ||
        String(item.category?.name || "").toLowerCase().includes(q)
    );
  }, [products?.content, search]);

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
        onConfirm={runProductDelete}
        title="Delete product?"
        description="This removes the product from the catalog. Customers will no longer see it."
        confirmLabel="Delete product"
        cancelLabel="Cancel"
        loading={deleting}
        danger
      />
      <AdminPageHeader
        title="Products"
        subtitle="Manage catalog items, edit details, and maintain stock."
        action={
          <Button type="button" onClick={() => navigate("/admin/product/create")}>
            Add product
          </Button>
        }
      />

      <AdminCard noPadding>
        <div className="flex flex-col gap-3 border-b border-line/60 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products…"
            className="ui-input sm:max-w-xs"
          />
          <p className="text-sm text-foreground-muted">
            Page {currentPage} of {totalPages}
          </p>
        </div>

        <InlineLoadingBar active={refreshing} label="Refreshing products" />

        {error && !loading && (products?.content?.length || 0) === 0 ? (
          <div className="px-4 py-12 text-center text-sm text-rose-600 sm:px-6">{error}</div>
        ) : (
          <TableWrapper className="rounded-none border-0 shadow-none">
            <table className="w-full min-w-[56rem] text-sm">
              <thead className="admin-table-head">
                <tr>
                  <th className="px-3 py-3">#</th>
                  <th className="px-3 py-3">Image</th>
                  <th className="px-3 py-3">Title</th>
                  <th className="px-3 py-3">Brand</th>
                  <th className="px-3 py-3">Category</th>
                  <th className="px-3 py-3">Price</th>
                  <th className="px-3 py-3">Qty</th>
                  <th className="px-3 py-3 text-right">Actions</th>
                </tr>
              </thead>
              {loading ? (
                <TableSkeleton rows={PAGE_SIZE} columns={COLUMN_COUNT} />
              ) : (
                <tbody className="divide-y divide-line bg-surface">
                  {rows.map((item, index) => {
                    const busy = deletingProductId === item._id;
                    return (
                      <tr
                        key={item._id}
                        className={classNames(
                          "transition hover:bg-surface-muted/60",
                          busy && "opacity-60"
                        )}
                        aria-busy={busy || undefined}
                      >
                        <td className="px-3 py-3 text-zinc-600">
                          {(currentPage - 1) * PAGE_SIZE + index + 1}
                        </td>
                        <td className="px-3 py-3">
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            loading="lazy"
                            className="h-12 w-12 rounded-lg object-cover ring-2 ring-zinc-100"
                          />
                        </td>
                        <td className="px-3 py-3 font-medium text-zinc-900">{item.title}</td>
                        <td className="px-3 py-3 text-zinc-700">{item.brand}</td>
                        <td className="px-3 py-3 text-zinc-600">{item.category?.name || "—"}</td>
                        <td className="whitespace-nowrap px-3 py-3 font-medium text-zinc-900">
                          ${item.price}
                        </td>
                        <td className="px-3 py-3 text-zinc-700">{item.quantity}</td>
                        <td className="px-3 py-3">
                          <div className="flex justify-end gap-2">
                            <Link
                              to={`/admin/products/${item._id}/edit`}
                              className="admin-action-btn whitespace-nowrap"
                            >
                              Edit
                            </Link>
                            <button
                              onClick={() => openDeleteConfirm(item._id)}
                              disabled={Boolean(deletingProductId)}
                              className="whitespace-nowrap rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-xs font-semibold text-rose-600 shadow-sm transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
                              type="button"
                            >
                              Delete
                            </button>
                          </div>
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
                        No products match your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              )}
            </table>
          </TableWrapper>
        )}

        <div className="flex items-center justify-center gap-2 border-t border-line/60 px-4 py-4 sm:px-6">
          <button
            type="button"
            disabled={currentPage <= 1 || loading}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="admin-action-btn"
          >
            Previous
          </button>
          <button
            type="button"
            disabled={currentPage >= totalPages || loading}
            onClick={() => setCurrentPage((p) => p + 1)}
            className="admin-action-btn"
          >
            Next
          </button>
        </div>
      </AdminCard>
    </div>
  );
};

export default ProductsTable;
