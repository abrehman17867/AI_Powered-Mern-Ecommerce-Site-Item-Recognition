"use client";

import React, { useState, useEffect } from "react";
import { Hero } from "../../components/Home/Hero.jsx";
import HomeTrustBar from "../../components/Home/HomeTrustBar.jsx";
import HomeCategories from "../../components/Home/HomeCategories.jsx";
import HomeFeaturedProducts from "../../components/Home/HomeFeaturedProducts.jsx";
import HomeVisualSearchCta from "../../components/Home/HomeVisualSearchCta.jsx";
import HomeNewArrivals from "../../components/Home/HomeNewArrivals.jsx";
import HomePromoBanners from "../../components/Home/HomePromoBanners.jsx";
import HomeNewsletter from "../../components/Home/HomeNewsletter.jsx";
import { api } from "../../../config/apiConfig.jsx";
import HomePageSkeleton from "./HomePageSkeleton";

export default function HomePage() {
  const [loading, setLoading] = useState(true);
  const [featured, setFeatured] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const [featuredRes, newestRes, categoriesRes] = await Promise.all([
          api.get("/api/products", {
            params: { pageNumber: 1, pageSize: 8, sort: "discount" },
          }),
          api.get("/api/products", {
            params: { pageNumber: 1, pageSize: 4, sort: "newest" },
          }),
          api.get("/api/products/categories"),
        ]);

        if (cancelled) return;

        const featuredList = featuredRes.data?.content || [];
        const newestList = newestRes.data?.content || [];
        setFeatured(featuredList);
        setNewArrivals(
          newestList.length > 0
            ? newestList
            : [...featuredList].reverse().slice(0, 4)
        );
        setCategories(Array.isArray(categoriesRes.data) ? categoriesRes.data : []);
      } catch {
        if (!cancelled) {
          try {
            const fallback = await api.get("/api/products", {
              params: { pageNumber: 1, pageSize: 8 },
            });
            if (!cancelled) {
              const list = fallback.data?.content || [];
              setFeatured(list);
              setNewArrivals(list.slice(0, 4));
            }
          } catch {
            setFeatured([]);
            setNewArrivals([]);
          }
          setCategories([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    // A skeleton of the real layout rather than a lone spinner: this is the
    // first screen after a sign-in redirect, and an empty page under the
    // navbar reads as a broken site.
    return <HomePageSkeleton />;
  }

  return (
    <>
      <Hero />
      <HomeTrustBar />
      <HomeCategories categories={categories} />
      <HomeFeaturedProducts products={featured} />
      <HomeVisualSearchCta />
      <HomePromoBanners />
      <HomeNewArrivals products={newArrivals} />
      <HomeNewsletter />
    </>
  );
}
