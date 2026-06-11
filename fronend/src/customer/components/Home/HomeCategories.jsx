import React from "react";
import { Link } from "react-router-dom";
import AppContainer from "../../../components/layout/AppContainer";
import HomeSectionHeader from "./HomeSectionHeader";
import { CATEGORY_TILES } from "./homeData";
import { categoryTileHref } from "./homeCategoryLinks";

export default function HomeCategories({ categories = [] }) {
  return (
    <section className="bg-surface-muted py-12 md:py-16">
      <AppContainer className="space-y-8 md:space-y-10">
        <HomeSectionHeader
          eyebrow="Collections"
          title="Shop by category"
          description="Explore curated departments — from everyday essentials to statement pieces."
          href="/products"
        />
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {CATEGORY_TILES.map((tile) => (
            <Link
              key={tile.name}
              to={categoryTileHref(categories, tile.name)}
              className="group relative aspect-[3/4] overflow-hidden rounded-2xl bg-zinc-200 shadow-sm ring-1 ring-zinc-900/5 transition hover:-translate-y-0.5 hover:shadow-xl"
            >
              <img
                src={tile.image}
                alt={tile.name}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
              />
              <div
                className={`absolute inset-0 bg-gradient-to-t ${tile.accent}`}
                aria-hidden
              />
              <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                <p className="text-lg font-bold text-white sm:text-xl">{tile.name}</p>
                <p className="mt-1 text-xs font-medium text-white/80 opacity-0 transition group-hover:opacity-100">
                  Shop now →
                </p>
              </div>
            </Link>
          ))}
        </div>
      </AppContainer>
    </section>
  );
}
