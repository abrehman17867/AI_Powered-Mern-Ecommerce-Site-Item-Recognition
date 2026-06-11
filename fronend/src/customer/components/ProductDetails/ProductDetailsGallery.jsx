import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MagnifyingGlassPlusIcon } from "@heroicons/react/24/outline";
import { classNames } from "../../../utils/classNames";
import ProductImageLightbox from "./ProductImageLightbox";

const ZOOM_SCALE = 2.2;

function ThumbnailButton({ src, index, active, onClick, className }) {
  return (
    <button
      type="button"
      onClick={() => onClick(index)}
      className={classNames(
        "relative shrink-0 overflow-hidden rounded-xl border-2 transition",
        active
          ? "border-brand-500 ring-2 ring-brand-500/20"
          : "border-line hover:border-brand-300",
        className
      )}
      aria-label={`View image ${index + 1}`}
      aria-current={active ? "true" : undefined}
    >
      <img src={src} alt="" className="h-full w-full object-cover" />
    </button>
  );
}

export default function ProductDetailsGallery({ product, className }) {
  const images = useMemo(() => {
    const list = [];
    if (product?.imageUrl) list.push(product.imageUrl);
    if (Array.isArray(product?.images)) {
      product.images.forEach((src) => {
        if (src && !list.includes(src)) list.push(src);
      });
    }
    return list;
  }, [product?.imageUrl, product?.images]);

  const [active, setActive] = useState(0);
  const [zooming, setZooming] = useState(false);
  const [origin, setOrigin] = useState({ x: 50, y: 50 });
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [canHoverZoom, setCanHoverZoom] = useState(false);
  const frameRef = useRef(null);

  const activeSrc = images[active] ?? images[0];

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    setCanHoverZoom(mq.matches);
    const onChange = (e) => setCanHoverZoom(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const handlePointerMove = useCallback((e) => {
    const el = frameRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = Math.min(100, Math.max(0, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.min(100, Math.max(0, ((e.clientY - rect.top) / rect.height) * 100));
    setOrigin({ x, y });
  }, []);

  if (!images.length) {
    return (
      <div
        className={classNames(
          "flex aspect-square items-center justify-center rounded-2xl border border-line bg-surface-muted",
          className
        )}
      >
        <span className="text-sm text-foreground-muted">No image</span>
      </div>
    );
  }

  return (
    <>
      <div className={classNames("flex flex-col gap-4 lg:flex-row lg:gap-5", className)}>
        {images.length > 1 && (
          <div className="order-2 hidden flex-col gap-2 lg:order-1 lg:flex">
            {images.map((src, index) => (
              <ThumbnailButton
                key={src}
                src={src}
                index={index}
                active={active === index}
                onClick={setActive}
                className="h-[4.5rem] w-[4.5rem]"
              />
            ))}
          </div>
        )}

        <div className="order-1 min-w-0 flex-1 lg:order-2">
          <div
            ref={frameRef}
            className="group relative overflow-hidden rounded-2xl border border-line bg-surface-muted shadow-card"
            onMouseEnter={() => canHoverZoom && setZooming(true)}
            onMouseLeave={() => setZooming(false)}
            onMouseMove={canHoverZoom ? handlePointerMove : undefined}
          >
            <button
              type="button"
              onClick={() => setLightboxOpen(true)}
              className="relative block w-full cursor-zoom-in text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
              aria-label="Enlarge product image"
            >
              <div className="aspect-square w-full sm:aspect-[4/5] lg:aspect-square">
                <img
                  src={activeSrc}
                  alt={product?.title || "Product"}
                  className="h-full w-full object-cover object-center transition-transform duration-150 ease-out will-change-transform"
                  style={{
                    transform: canHoverZoom && zooming ? `scale(${ZOOM_SCALE})` : "scale(1)",
                    transformOrigin: `${origin.x}% ${origin.y}%`,
                  }}
                  draggable={false}
                />
              </div>

              <span className="pointer-events-none absolute bottom-4 right-4 flex items-center gap-1.5 rounded-full bg-zinc-900/70 px-3 py-1.5 text-xs font-medium text-white opacity-100 backdrop-blur-sm transition group-hover:bg-zinc-900/85 lg:opacity-0 lg:group-hover:opacity-100">
                <MagnifyingGlassPlusIcon className="h-4 w-4" />
                Click to enlarge
              </span>
            </button>

            {Number(product?.discountedPersent) > 0 && (
              <span className="pointer-events-none absolute left-4 top-4 rounded-full bg-red-500 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white shadow-sm">
                -{product.discountedPersent}%
              </span>
            )}
          </div>

          <p className="mt-2 hidden text-center text-xs text-foreground-muted lg:block">
            Hover to magnify · Click for full view
          </p>
        </div>

        {images.length > 1 && (
          <div className="order-3 flex gap-2 overflow-x-auto pb-1 lg:hidden">
            {images.map((src, index) => (
              <ThumbnailButton
                key={src}
                src={src}
                index={index}
                active={active === index}
                onClick={setActive}
                className="h-16 w-16 sm:h-20 sm:w-20"
              />
            ))}
          </div>
        )}
      </div>

      <ProductImageLightbox
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        images={images}
        activeIndex={active}
        onSelect={setActive}
        title={product?.title}
      />
    </>
  );
}
