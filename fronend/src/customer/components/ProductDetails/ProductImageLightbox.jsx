import React, { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

export default function ProductImageLightbox({
  open,
  onClose,
  images,
  activeIndex,
  onSelect,
  title,
}) {
  const total = images?.length || 0;
  const src = images?.[activeIndex];

  const goPrev = () => onSelect?.((activeIndex - 1 + total) % total);
  const goNext = () => onSelect?.((activeIndex + 1) % total);

  return (
    <Transition show={open} as={Fragment}>
      <Dialog as="div" className="relative z-[100]" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-zinc-950/90 backdrop-blur-sm" aria-hidden />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto p-4 sm:p-8">
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
              <Dialog.Panel className="relative w-full max-w-5xl">
                <button
                  type="button"
                  onClick={onClose}
                  className="absolute -top-2 right-0 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:-right-2 sm:top-0"
                  aria-label="Close"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>

                <div className="overflow-hidden rounded-2xl bg-zinc-900 ring-1 ring-white/10">
                  <img
                    src={src}
                    alt={title || "Product"}
                    className="max-h-[min(80vh,720px)] w-full object-contain"
                  />
                </div>

                {total > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={goPrev}
                      className="absolute left-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-zinc-800 shadow-lg transition hover:bg-white sm:-left-14"
                      aria-label="Previous image"
                    >
                      <ChevronLeftIcon className="h-6 w-6" />
                    </button>
                    <button
                      type="button"
                      onClick={goNext}
                      className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-zinc-800 shadow-lg transition hover:bg-white sm:-right-14"
                      aria-label="Next image"
                    >
                      <ChevronRightIcon className="h-6 w-6" />
                    </button>
                    <div className="mt-4 flex justify-center gap-2 overflow-x-auto pb-1">
                      {images.map((img, i) => (
                        <button
                          key={img}
                          type="button"
                          onClick={() => onSelect?.(i)}
                          className={`h-14 w-14 shrink-0 overflow-hidden rounded-lg border-2 transition ${
                            i === activeIndex
                              ? "border-brand-500 ring-2 ring-brand-500/30"
                              : "border-white/20 opacity-70 hover:opacity-100"
                          }`}
                        >
                          <img src={img} alt="" className="h-full w-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
