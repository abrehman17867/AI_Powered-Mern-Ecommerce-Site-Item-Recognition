"use client";

import React, { useEffect, useState } from "react";
import { useNavigate } from "@/lib/navigation";
import { CameraIcon, SparklesIcon } from "@heroicons/react/24/outline";
import Button from "../../../components/ui/Button";
import ButtonPrimary from "../ui/ButtonPrimary";
import { api } from "../../../config/apiConfig";

/** Fixed hero background — do not tie to API product order (varies per request). */
const HERO_BACKGROUND =
  "https://images.pexels.com/photos/1485031/pexels-photo-1485031.jpeg?auto=compress&cs=tinysrgb&w=1920";
const HERO_BACKGROUND_FALLBACK =
  "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&auto=format&fit=crop&q=80";

export const Hero = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [heroBg, setHeroBg] = useState(HERO_BACKGROUND);

  useEffect(() => {
    api
      .get("/api/products")
      .then(({ data }) => setProducts(data?.content?.slice(0, 4) || []))
      .catch(() => setProducts([]));
  }, []);

  return (
    <section className="relative isolate min-h-[min(92vh,880px)] w-full overflow-hidden">
      <img
        src={heroBg}
        alt=""
        className="absolute inset-0 h-full w-full object-cover object-center"
        fetchPriority="high"
        onError={() => {
          if (heroBg !== HERO_BACKGROUND_FALLBACK) {
            setHeroBg(HERO_BACKGROUND_FALLBACK);
          }
        }}
      />
      <div
        className="absolute inset-0 bg-gradient-to-r from-zinc-950/92 via-zinc-950/55 to-zinc-950/25"
        aria-hidden
      />
      <div
        className="absolute inset-0 bg-gradient-to-t from-zinc-950/70 via-transparent to-zinc-950/30"
        aria-hidden
      />

      <div className="relative mx-auto grid min-h-[min(92vh,880px)] max-w-app lg:grid-cols-2 lg:gap-8">
        {/* Left — copy */}
        <div className="flex flex-col justify-center px-4 pb-12 pt-28 sm:px-6 sm:pt-32 lg:px-8 lg:pb-16 lg:pt-36">
          <div className="max-w-xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-orange-200 backdrop-blur-sm">
              <SparklesIcon className="h-4 w-4" aria-hidden />
              AI-powered shopping
            </p>
            <h1 className="mt-6 font-display text-4xl font-bold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-[3.25rem]">
              Curated fashion,
              <span className="block text-orange-400">found your way.</span>
            </h1>
            <p className="mt-5 text-base leading-relaxed text-zinc-300 sm:text-lg">
              Browse premium picks, search by photo, and checkout in minutes.
            </p>

            {/* Both CTAs share one width and height: stacked full-width on
                phones, equal-basis side by side from sm up. They previously
                carried different padding, so the stacked buttons came out
                visibly different sizes. */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-stretch">
              <ButtonPrimary
                type="button"
                className="w-full justify-center !px-8 !py-3 sm:w-auto"
                onClick={() => navigate("/products")}
              >
                Shop collection
              </ButtonPrimary>
              <Button
                type="button"
                variant="secondary"
                size="lg"
                className="w-full justify-center border-white/25 bg-white/10 !px-8 !py-3 !text-white hover:border-orange-300/50 sm:w-auto"
                onClick={() => navigate("/products")}
              >
                <CameraIcon className="h-5 w-5" aria-hidden />
                Visual search
              </Button>
            </div>

            <dl className="mt-10 grid grid-cols-3 gap-4 border-t border-white/10 pt-8">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-orange-300/90">Delivery</dt>
                <dd className="mt-1 text-sm font-semibold text-white">Free over $50</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-orange-300/90">Returns</dt>
                <dd className="mt-1 text-sm font-semibold text-white">30-day easy</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-orange-300/90">Search</dt>
                <dd className="mt-1 text-sm font-semibold text-white">Photo + text</dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Right — trending products */}
        <div className="flex flex-col justify-end gap-3 px-4 pb-10 pt-4 sm:px-6 sm:pb-12 lg:justify-center lg:px-8 lg:pb-16 lg:pt-36">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/80 lg:text-right">
            Trending now
          </p>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:ml-auto lg:max-w-md">
            {(products.length > 0
              ? products
              : [
                  {
                    _id: "p1",
                    title: "Explore the catalog",
                    brand: "Ecommerce",
                    discountedPrice: "—",
                    imageUrl: HERO_BACKGROUND,
                  },
                ]
            ).map((product) => (
              <button
                key={product._id}
                type="button"
                onClick={() =>
                  product._id !== "p1" && navigate(`/product/${product._id}`)
                }
                className="group overflow-hidden rounded-2xl border border-white/20 bg-white/10 p-3 text-left shadow-xl backdrop-blur-md transition hover:-translate-y-0.5 hover:border-orange-300/40 hover:bg-white/15"
              >
                <div className="aspect-square overflow-hidden rounded-xl bg-white/10">
                  <img
                    src={product.imageUrl}
                    alt={product.title}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                </div>
                <p className="mt-2 truncate text-[10px] font-semibold uppercase tracking-wide text-orange-200">
                  {product.brand}
                </p>
                <p className="line-clamp-2 text-sm font-semibold text-white">
                  {product.title}
                </p>
                {product.discountedPrice !== "—" && (
                  <p className="mt-1 text-sm font-bold text-white">
                    ${product.discountedPrice}
                  </p>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
