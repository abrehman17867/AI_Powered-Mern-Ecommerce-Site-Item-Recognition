import React, { useEffect, useMemo, useState } from "react";
import { deleteProduct, findProducts } from "../../State/Product/Action";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import AdminPageHeader from "./ui/AdminPageHeader";
import AdminCard from "./ui/AdminCard";
import ConfirmDialog from "./ui/ConfirmDialog";
import TableWrapper from "../../components/ui/TableWrapper";
import { adminToast } from "../../utils/adminToast";

const ProductsTable = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const productSlice = useSelector((store) => store.products);
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const [search, setSearch] = useState("");

  const loading = productSlice.loading || deleteBusy;

  const handlePaginationChange = (event, value) => {
    setCurrentPage(value);
  };

  useEffect(() => {
    const data = {
      category: "",
      colors: [],
      sizes: [],
      minPrice: 0,
      maxPrice: 100000,
      minDiscount: 0,
      sort: "price_low",
      pageNumber: currentPage,
      pageSize: 9,
      stock: "",
    };
    dispatch(findProducts(data));
  }, [currentPage, productSlice.deletedProduct, dispatch]);

  const openDeleteConfirm = (productId) => {
    setPendingDeleteId(productId);
    setConfirmOpen(true);
  };

  const runProductDelete = () => {
    if (!pendingDeleteId) return;
    setDeleteBusy(true);
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
      })
      .finally(() => setDeleteBusy(false));
  };

  const rows = useMemo(() => {
    const all = productSlice?.products?.content || [];
    if (!search.trim()) return all;
    const q = search.toLowerCase();
    return all.filter(
      (item) =>
        String(item.title || "").toLowerCase().includes(q) ||
        String(item.brand || "").toLowerCase().includes(q) ||
        String(item.category?.name || "").toLowerCase().includes(q)
    );
  }, [productSlice?.products?.content, search]);

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
        onConfirm={runProductDelete}
        title="Delete product?"
        description="This removes the product from the catalog. Customers will no longer see it."
        confirmLabel="Delete product"
        cancelLabel="Cancel"
        loading={deleteBusy}
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
        <div className="flex flex-col gap-3 border-b border-line/60 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products…"
            className="ui-input sm:max-w-xs"
          />
          <p className="text-sm text-foreground-muted">
            Page {currentPage} of {productSlice.products?.totalPages || 1}
          </p>
        </div>

        {loading ? (
          <div className="py-12 text-center text-sm text-foreground-muted">Loading products…</div>
        ) : (
          <TableWrapper className="border-0 shadow-none rounded-none">
            <table className="min-w-full text-sm">
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
              <tbody className="divide-y divide-line bg-surface">
                {rows.map((item, index) => (
                  <tr key={item._id} className="transition hover:bg-surface-muted/60">
                    <td className="px-3 py-3 text-zinc-600">{(currentPage - 1) * 9 + index + 1}</td>
                    <td className="px-3 py-3">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="h-12 w-12 rounded-lg object-cover ring-2 ring-zinc-100"
                      />
                    </td>
                    <td className="px-3 py-3 font-medium text-zinc-900">{item.title}</td>
                    <td className="px-3 py-3 text-zinc-700">{item.brand}</td>
                    <td className="px-3 py-3 text-zinc-600">{item.category?.name || "—"}</td>
                    <td className="px-3 py-3 font-medium text-zinc-900">${item.price}</td>
                    <td className="px-3 py-3 text-zinc-700">{item.quantity}</td>
                    <td className="px-3 py-3">
                      <div className="flex justify-end gap-2">
                        <Link
                          to={`/admin/products/${item._id}/edit`}
                          className="admin-action-btn"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => openDeleteConfirm(item._id)}
                          className="rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-xs font-semibold text-rose-600 shadow-sm transition hover:bg-rose-50"
                          type="button"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-3 py-8 text-center text-sm text-zinc-500">
                      No products match your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </TableWrapper>
        )}

        <div className="flex items-center justify-center gap-2 border-t border-line/60 px-5 py-4">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={(e) => handlePaginationChange(e, currentPage - 1)}
            className="admin-action-btn"
          >
            Previous
          </button>
          <button
            type="button"
            disabled={currentPage >= (productSlice.products?.totalPages || 1)}
            onClick={(e) => handlePaginationChange(e, currentPage + 1)}
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
