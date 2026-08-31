"use client";

import React, { useEffect } from "react";
import { Link } from "@/lib/navigation";
import { useDispatch, useSelector } from "react-redux";
import { findProducts } from "../../../State/Product/Action";
import HomeProductCard from "../../components/Home/HomeProductCard";
import { ArrowRightIcon } from "@heroicons/react/24/outline";

export default function PaymentRecommendations({ title, description }) {
  const dispatch = useDispatch();
  const products = useSelector((store) => store.products?.products?.content || []);

  useEffect(() => {
    dispatch(
      findProducts(
        {
          category: "",
          colors: [],
          sizes: [],
          minPrice: 0,
          maxPrice: 100000,
          minDiscount: 0,
          sort: "newest",
          pageNumber: 1,
          pageSize: 3,
          stock: "",
        },
        { silent: true }
      )
    );
  }, [dispatch]);

  const items = products.slice(0, 3);
  if (items.length === 0) return null;

  return (
    <section className="border-t border-line bg-surface-muted/30 py-12 md:py-16">
      <div className="app-container">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">
              Discover more
            </p>
            <h2 className="mt-1 text-xl font-bold text-foreground sm:text-2xl">{title}</h2>
            {description ? (
              <p className="mt-1 max-w-lg text-sm text-foreground-muted">{description}</p>
            ) : null}
          </div>
          <Link
            to="/products"
            className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700"
          >
            View all
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
          {items.map((product) => (
            <HomeProductCard key={product._id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
