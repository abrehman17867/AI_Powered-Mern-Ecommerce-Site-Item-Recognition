"use client";

import React from "react";
import AppContainer from "../../../components/layout/AppContainer";
import { Skeleton } from "../../../components/ui/Skeleton";

/**
 * Placeholder that mirrors the storefront's real layout while its data loads.
 *
 * The page previously swapped itself for a single centred spinner, which under
 * the fixed navbar looked like an empty site — especially arriving from a
 * sign-in redirect, where that is the first thing a shopper sees. Matching the
 * actual section rhythm means the page settles into place instead of appearing
 * from nothing.
 */
function CardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
      <Skeleton className="aspect-[4/5] w-full" rounded="rounded-none" />
      <div className="space-y-2 p-4">
        <Skeleton className="h-2.5 w-14" />
        <Skeleton className="h-3.5 w-full" />
        <Skeleton className="h-4 w-16" />
      </div>
    </div>
  );
}

function SectionHeadingSkeleton() {
  return (
    <div className="mb-8">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="mt-3 h-7 w-56 max-w-full" />
      <Skeleton className="mt-2 h-3.5 w-72 max-w-full" />
    </div>
  );
}

export default function HomePageSkeleton() {
  return (
    <div aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading storefront…</span>

      {/* Hero */}
      <section className="relative overflow-hidden bg-zinc-950">
        <AppContainer>
          <div className="grid items-center gap-10 py-14 md:py-20 lg:grid-cols-2">
            <div>
              <Skeleton className="h-7 w-44 rounded-full bg-white/[0.07]" />
              <Skeleton className="mt-6 h-11 w-full max-w-md bg-white/[0.07]" />
              <Skeleton className="mt-3 h-11 w-3/4 max-w-sm bg-white/[0.07]" />
              <Skeleton className="mt-5 h-4 w-full max-w-sm bg-white/[0.07]" />
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Skeleton className="h-12 w-full rounded-lg bg-white/[0.07] sm:w-44" />
                <Skeleton className="h-12 w-full rounded-lg bg-white/[0.07] sm:w-44" />
              </div>
              <div className="mt-10 grid grid-cols-3 gap-4 border-t border-white/10 pt-8">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i}>
                    <Skeleton className="h-2.5 w-16 bg-white/[0.07]" />
                    <Skeleton className="mt-2 h-3.5 w-20 bg-white/[0.07]" />
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {Array.from({ length: 2 }).map((_, i) => (
                <Skeleton key={i} className="aspect-[4/5] w-full rounded-2xl bg-white/[0.07]" />
              ))}
            </div>
          </div>
        </AppContainer>
      </section>

      {/* Trust bar */}
      <AppContainer className="py-8 md:py-10">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 shrink-0 rounded-xl" />
              <div className="min-w-0 flex-1">
                <Skeleton className="h-3.5 w-24" />
                <Skeleton className="mt-2 h-3 w-16" />
              </div>
            </div>
          ))}
        </div>
      </AppContainer>

      {/* Categories */}
      <section className="bg-surface-muted py-12 md:py-16">
        <AppContainer>
          <SectionHeadingSkeleton />
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[4/3] w-full rounded-2xl" />
            ))}
          </div>
        </AppContainer>
      </section>

      {/* Featured products */}
      <section className="bg-white py-12 md:py-16">
        <AppContainer>
          <SectionHeadingSkeleton />
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 lg:gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        </AppContainer>
      </section>
    </div>
  );
}
