"use client";

import React from "react";
import { Link } from "@/lib/navigation";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import AppContainer from "../../../components/layout/AppContainer";
import { PROMO_BANNERS } from "./homeData";
import { classNames } from "../../../utils/classNames";

export default function HomePromoBanners() {
  return (
    <section className="bg-white py-12 md:py-16">
      <AppContainer>
        <div className="grid gap-4 md:grid-cols-2 md:gap-6">
          {PROMO_BANNERS.map((banner) => (
            <Link
              key={banner.id}
              to={banner.href}
              className="group relative flex min-h-[280px] overflow-hidden rounded-3xl bg-zinc-900 shadow-lg ring-1 ring-zinc-900/10 transition hover:-translate-y-0.5 hover:shadow-xl md:min-h-[320px]"
            >
              <img
                src={banner.image}
                alt=""
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
              />
              <div
                className={classNames(
                  "absolute inset-0",
                  banner.tone === "light"
                    ? "bg-gradient-to-r from-white/95 via-white/80 to-white/20"
                    : "bg-gradient-to-r from-zinc-950/90 via-zinc-950/60 to-transparent"
                )}
                aria-hidden
              />
              <div className="relative flex flex-col justify-end p-6 sm:p-8 md:max-w-[70%]">
                <p
                  className={classNames(
                    "text-xs font-semibold uppercase tracking-[0.2em]",
                    banner.tone === "light" ? "text-brand-600" : "text-orange-300"
                  )}
                >
                  {banner.eyebrow}
                </p>
                <h3
                  className={classNames(
                    "mt-2 font-display text-2xl font-bold tracking-tight sm:text-3xl",
                    banner.tone === "light" ? "text-zinc-900" : "text-white"
                  )}
                >
                  {banner.title}
                </h3>
                <p
                  className={classNames(
                    "mt-2 text-sm leading-relaxed",
                    banner.tone === "light" ? "text-zinc-600" : "text-zinc-300"
                  )}
                >
                  {banner.description}
                </p>
                <span
                  className={classNames(
                    "mt-5 inline-flex items-center gap-1.5 text-sm font-semibold",
                    banner.tone === "light"
                      ? "text-zinc-900 group-hover:text-brand-600"
                      : "text-white group-hover:text-orange-300"
                  )}
                >
                  {banner.cta}
                  <ArrowRightIcon className="h-4 w-4 transition group-hover:translate-x-0.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </AppContainer>
    </section>
  );
}
