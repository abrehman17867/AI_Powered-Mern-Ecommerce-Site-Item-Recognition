"use client";

import React, { Fragment, useEffect, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "@/lib/navigation";
import Button from "../../../../components/ui/Button";

export default function ProductQuickView({ product, open, onClose, onAddToCart }) {
  const navigate = useNavigate();
  const [qty, setQty] = useState(1);
  const [size, setSize] = useState("");
  const [adding, setAdding] = useState(false);
  const [feedback, setFeedback] = useState("");

  const sizes = product?.sizes?.filter((s) => Number(s.quantity) > 0) || [];

  useEffect(() => {
    if (!open || !product) return;
    setQty(1);
    setFeedback("");
    setAdding(false);
    const available = product.sizes?.filter((s) => Number(s.quantity) > 0) || [];
    setSize(available[0]?.name || "");
  }, [open, product]);

  if (!product) return null;

  const inStock = (product.quantity ?? 0) > 0;

  const handleAdd = async () => {
    if (sizes.length > 0 && !size) {
      setFeedback("Please select a size.");
      return;
    }
    setAdding(true);
    setFeedback("");
    try {
      await onAddToCart?.(product, {
        size: size || sizes[0]?.name,
        qty,
      });
    } catch (e) {
      setFeedback(e?.message || "Could not add to cart.");
    } finally {
      setAdding(false);
    }
  };

  return (
    <Transition show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-zinc-900/50" aria-hidden="true" />
        </Transition.Child>
        <div className="fixed inset-0 overflow-y-auto p-4 sm:p-6">
          <div className="flex min-h-full items-center justify-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl">
                <div className="relative grid gap-6 p-6 sm:grid-cols-2">
                  <button
                    type="button"
                    className="absolute right-4 top-4 rounded-full p-2 hover:bg-zinc-100"
                    onClick={onClose}
                    aria-label="Close quick view"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                  <div className="overflow-hidden rounded-xl bg-zinc-50">
                    <img
                      src={product.imageUrl}
                      alt={product.title}
                      className="aspect-square w-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase text-foreground-muted">
                      {product.brand}
                    </p>
                    <Dialog.Title className="mt-1 text-xl font-bold text-foreground">
                      {product.title}
                    </Dialog.Title>
                    <div className="mt-3 flex items-baseline gap-2">
                      <span className="text-2xl font-bold">
                        ${product.discountedPrice ?? product.price}
                      </span>
                      {product.price > product.discountedPrice && (
                        <span className="text-sm line-through text-foreground-muted">
                          ${product.price}
                        </span>
                      )}
                    </div>
                    <p className="mt-3 line-clamp-4 text-sm text-foreground-muted">
                      {product.description}
                    </p>
                    {sizes.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm font-semibold">Size</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {sizes.map((s) => (
                            <button
                              key={s.name}
                              type="button"
                              onClick={() => setSize(s.name)}
                              className={`rounded-lg border px-3 py-1.5 text-sm font-medium ${
                                size === s.name
                                  ? "border-brand-500 bg-brand-500 text-white"
                                  : "border-line"
                              }`}
                            >
                              {s.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="mt-4 flex items-center gap-3">
                      <label className="text-sm font-semibold" htmlFor="qv-qty">
                        Qty
                      </label>
                      <input
                        id="qv-qty"
                        type="number"
                        min={1}
                        max={99}
                        value={qty}
                        onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
                        className="w-16 rounded-lg border border-line px-2 py-1 text-sm"
                      />
                    </div>
                    {feedback ? (
                      <p className="mt-3 text-sm font-medium text-red-600" role="alert">
                        {feedback}
                      </p>
                    ) : null}
                    <div className="mt-6 flex flex-col gap-2 sm:flex-row">
                      <Button
                        type="button"
                        disabled={!inStock || adding}
                        className="flex-1"
                        onClick={handleAdd}
                      >
                        {adding ? "Adding…" : "Add to cart"}
                      </Button>
                      <Button
                        variant="secondary"
                        className="flex-1"
                        type="button"
                        onClick={() => {
                          onClose();
                          navigate(`/product/${product._id}`);
                        }}
                      >
                        View full details
                      </Button>
                    </div>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
