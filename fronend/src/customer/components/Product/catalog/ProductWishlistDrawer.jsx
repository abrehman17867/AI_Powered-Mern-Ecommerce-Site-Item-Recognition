import React, { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon, TrashIcon } from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";
import Button from "../../../../components/ui/Button";

export default function ProductWishlistDrawer({
  open,
  items,
  onClose,
  onRemove,
  onClear,
  onAddToCart,
}) {
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
          <div className="fixed inset-0 bg-zinc-900/40" />
        </Transition.Child>
        <div className="fixed inset-y-0 right-0 flex max-w-full">
          <Transition.Child
            as={Fragment}
            enter="transform transition ease-out duration-200"
            enterFrom="translate-x-full"
            enterTo="translate-x-0"
            leave="transform transition ease-in duration-150"
            leaveFrom="translate-x-0"
            leaveTo="translate-x-full"
          >
            <Dialog.Panel className="flex h-full w-screen max-w-md flex-col bg-white shadow-xl">
              <div className="flex items-center justify-between border-b border-line px-4 py-4">
                <Dialog.Title className="text-lg font-bold">
                  Wishlist ({items.length})
                </Dialog.Title>
                <button type="button" onClick={onClose} aria-label="Close wishlist">
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                {items.length === 0 ? (
                  <p className="text-center text-sm text-foreground-muted">
                    Save items you love with the heart icon on any product.
                  </p>
                ) : (
                  <ul className="space-y-4">
                    {items.map((product) => (
                      <li
                        key={product._id}
                        className="flex gap-3 rounded-xl border border-line p-3 shadow-sm"
                      >
                        <Link
                          to={`/product/${product._id}`}
                          onClick={onClose}
                          className="shrink-0"
                        >
                          <img
                            src={product.imageUrl}
                            alt=""
                            className="h-20 w-20 rounded-lg object-cover"
                          />
                        </Link>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold uppercase text-foreground-muted">
                            {product.brand}
                          </p>
                          <Link
                            to={`/product/${product._id}`}
                            onClick={onClose}
                            className="line-clamp-2 text-sm font-medium hover:text-brand-600"
                          >
                            {product.title}
                          </Link>
                          <p className="mt-1 text-sm font-bold">
                            ${product.discountedPrice ?? product.price}
                          </p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            <Button
                              size="sm"
                              onClick={() => onAddToCart?.(product)}
                            >
                              Add to cart
                            </Button>
                            <button
                              type="button"
                              onClick={() => onRemove(product._id)}
                              className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                              aria-label={`Remove ${product.title} from wishlist`}
                            >
                              <TrashIcon className="h-4 w-4" />
                              Remove
                            </button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {items.length > 0 && (
                <div className="border-t border-line p-4">
                  <Button variant="secondary" className="w-full" onClick={onClear}>
                    Clear wishlist
                  </Button>
                </div>
              )}
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
