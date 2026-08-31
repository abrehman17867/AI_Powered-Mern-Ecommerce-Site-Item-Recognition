"use client";

import React from "react";
import CatalogProductCard from "./CatalogProductCard";
import { ProductSkeleton } from "./ProductSkeleton";
import EmptyState from "../../../../components/ui/EmptyState";

export default function ProductGrid({
  products,
  loading,
  view,
  searchQuery,
  wishlist,
  compare,
  onWishlist,
  onCompare,
  onQuickView,
  onAddToCart,
  error,
  emptyTitle,
  emptyDescription,
}) {
  if (loading && !products?.length) {
    return <ProductSkeleton count={12} view={view} />;
  }

  if (error) {
    return (
      <EmptyState
        title="Something went wrong"
        description={error}
      />
    );
  }

  if (!products?.length) {
    return (
      <EmptyState
        title={emptyTitle || "No products found"}
        description={
          emptyDescription ||
          "Try adjusting filters, clearing search, or browsing all categories."
        }
      />
    );
  }

  if (view === "list") {
    return (
      <ul className="space-y-4">
        {products.map((product) => (
          <li key={product._id}>
            <CatalogProductCard
              product={product}
              view="list"
              searchQuery={searchQuery}
              isWishlisted={wishlist.has(product._id)}
              isCompared={compare.has(product._id)}
              onWishlist={onWishlist}
              onCompare={onCompare}
              onQuickView={onQuickView}
              onAddToCart={onAddToCart}
            />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div
      className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 lg:gap-5"
      role="list"
    >
      {products.map((product) => (
        <div key={product._id} role="listitem">
          <CatalogProductCard
            product={product}
            view="grid"
            searchQuery={searchQuery}
            isWishlisted={wishlist.has(product._id)}
            isCompared={compare.has(product._id)}
            onWishlist={onWishlist}
            onCompare={onCompare}
            onQuickView={onQuickView}
            onAddToCart={onAddToCart}
          />
        </div>
      ))}
    </div>
  );
}
