import React from "react";
import AppContainer from "../../../components/layout/AppContainer";
import HomeSectionHeader from "./HomeSectionHeader";
import HomeProductCard from "./HomeProductCard";

export default function HomeFeaturedProducts({ products = [] }) {
  const items = products.slice(0, 8);

  if (items.length === 0) return null;

  return (
    <section className="bg-white py-12 md:py-16">
      <AppContainer className="space-y-8 md:space-y-10">
        <HomeSectionHeader
          eyebrow="Editor's pick"
          title="Featured products"
          description="Hand-selected styles with the best value — updated from our live catalog."
          href="/products?sort=discount"
          linkLabel="Shop featured"
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
