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

      {/* Hero — mirrors Hero.jsx exactly, including the top padding that clears
          the fixed navbar (the home route renders no nav spacer, so the hero
          has to make room for it itself) and the min-height, so the page does
          not jump when the real hero replaces this. */}
      <section className="relative overflow-hidden bg-zinc-950">
        <div className="relative mx-auto grid min-h-[min(92vh,880px)] max-w-app lg:grid-cols-2 lg:gap-8">
          <div className="flex flex-col justify-center px-4 pb-12 pt-28 sm:px-6 sm:pt-32 lg:px-8 lg:pb-16 lg:pt-36">
            <div className="max-w-xl">
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
          </div>

          <div className="flex flex-col justify-end gap-3 px-4 pb-10 pt-4 sm:px-6 sm:pb-12 lg:justify-center lg:px-8 lg:pb-16 lg:pt-36">
            <Skeleton className="h-3 w-28 bg-white/[0.07] lg:ml-auto" />
            {/* Four cards shaped like Hero.jsx's trending tiles: a p-3 box with
                a square image and brand / title / price lines. Two plain
                aspect-[4/5] blocks left the mobile hero 300px short and the
                page lurched when the real one replaced it. */}
            {/* w-full is load-bearing: lg:ml-auto is an auto cross-axis margin,
                which cancels the flex stretch and makes this size to content.
                The real cards hold <img> elements so they have intrinsic width;
                placeholders do not, and the grid collapsed to 74px columns. */}
            <div className="grid w-full grid-cols-2 gap-3 sm:gap-4 lg:ml-auto lg:max-w-md">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="overflow-hidden rounded-2xl border border-white/20 bg-white/10 p-3"
                >
                  <Skeleton className="aspect-square w-full rounded-xl bg-white/[0.07]" />
                  <Skeleton className="mt-2 h-2.5 w-12 bg-white/[0.07]" />
                  <Skeleton className="mt-1.5 h-3.5 w-full bg-white/[0.07]" />
                  <Skeleton className="mt-1 h-3.5 w-10 bg-white/[0.07]" />
                </div>
              ))}
            </div>
          </div>
        </div>
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
