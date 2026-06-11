import React, { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import Button from "../../../../components/ui/Button";

const FIELDS = [
  { key: "brand", label: "Brand" },
  { key: "title", label: "Name" },
  { key: "discountedPrice", label: "Price", format: (p) => `$${p.discountedPrice ?? p.price}` },
  { key: "discountedPersent", label: "Discount", format: (p) => `${p.discountedPersent || 0}%` },
  { key: "quantity", label: "Stock", format: (p) => (p.quantity > 0 ? "In stock" : "Out of stock") },
  { key: "color", label: "Color" },
];

export default function ProductCompareDrawer({ open, items, onClose, onRemove, onClear }) {
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
            <Dialog.Panel className="flex h-full w-screen max-w-2xl flex-col bg-white shadow-xl">
              <div className="flex items-center justify-between border-b border-line px-4 py-4">
                <Dialog.Title className="text-lg font-bold">
                  Compare ({items.length}/4)
                </Dialog.Title>
                <button type="button" onClick={onClose} aria-label="Close compare">
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              <div className="flex-1 overflow-auto p-4">
                {items.length === 0 ? (
                  <p className="text-sm text-foreground-muted">
                    Add up to 4 products using the compare button on product cards.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                      <thead>
                        <tr>
                          <th className="p-2 font-semibold">Feature</th>
                          {items.map((p) => (
                            <th key={p._id} className="min-w-[8rem] p-2">
                              <img
                                src={p.imageUrl}
                                alt=""
                                className="mx-auto h-16 w-16 rounded-lg object-cover"
                              />
                              <button
                                type="button"
                                className="mt-1 text-xs text-red-600"
                                onClick={() => onRemove(p._id)}
                              >
                                Remove
                              </button>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {FIELDS.map((field) => (
                          <tr key={field.key} className="border-t border-line">
                            <td className="p-2 font-medium text-foreground-muted">
                              {field.label}
                            </td>
                            {items.map((p) => (
                              <td key={p._id} className="p-2">
                                {field.format
                                  ? field.format(p)
                                  : p[field.key] ?? "—"}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
              {items.length > 0 && (
                <div className="border-t border-line p-4">
                  <Button variant="secondary" className="w-full" onClick={onClear}>
                    Clear compare list
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
