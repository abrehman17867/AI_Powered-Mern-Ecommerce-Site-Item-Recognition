import React from "react";
import AppContainer from "../../../components/layout/AppContainer";
import HomeSectionHeader from "./HomeSectionHeader";
import HomeProductCard from "./HomeProductCard";

export default function HomeNewArrivals({ products = [] }) {
  const items = products.slice(0, 4);

  if (items.length === 0) return null;

  return (
    <section className="bg-surface-muted py-12 md:py-16">
      <AppContainer className="space-y-8 md:space-y-10">
        <HomeSectionHeader
          eyebrow="Fresh drops"
          title="New arrivals"
          description="The latest additions to our store — be the first to discover them."
          href="/products?sort=newest"
          linkLabel="See all new"
        />
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 lg:gap-5">
          {items.map((product) => (
            <HomeProductCard key={product._id} product={product} />
          ))}
        </div>
      </AppContainer>
    </section>
  );
}
