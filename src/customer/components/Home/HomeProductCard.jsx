"use client";

import React from "react";
import { Link } from "@/lib/navigation";
import { classNames } from "../../../utils/classNames";

export default function HomeProductCard({ product, className }) {
  if (!product?._id) return null;

  const discount = Number(product.discountedPersent) || 0;
  const hasSale = discount > 0;
  const price = product.discountedPrice ?? product.price;
  const original = product.price;

  return (
    <Link
      to={`/product/${product._id}`}
      className={classNames(
        "group flex flex-col overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-zinc-300 hover:shadow-lg",
        className
      )}
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-zinc-100">
        <img
          src={product.imageUrl}
          alt={product.title || "Product"}
          loading="lazy"
          className="h-full w-full object-cover object-center transition duration-500 group-hover:scale-105"
        />
        {hasSale ? (
          <span className="absolute left-3 top-3 rounded-lg bg-red-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
            -{Math.round(discount)}%
          </span>
        ) : null}
        <div className="absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-zinc-950/80 to-transparent p-4 transition duration-300 group-hover:translate-y-0">
          <span className="text-xs font-semibold text-white">Quick view →</span>
        </div>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
          {product.brand}
        </p>
        <h3 className="mt-1 line-clamp-2 text-sm font-semibold text-zinc-900">
          {product.title}
        </h3>
        <div className="mt-auto flex items-baseline gap-2 pt-3">
          <span className="text-base font-bold text-zinc-900">${price}</span>
          {hasSale && original != null ? (
            <span className="text-sm text-zinc-400 line-through">${original}</span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
