"use client";

import React from "react";
import { Link } from "@/lib/navigation";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

const highlights = [
  "Secure checkout & order tracking",
  "Save addresses for faster delivery",
  "AI-powered product discovery",
];

export default function AuthShell({ mode = "login", children }) {
  const isLogin = mode === "login";

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left — brand panel (always on desktop; compact strip on mobile) */}
      <aside className="relative flex flex-col justify-between overflow-hidden bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 px-6 py-8 sm:px-8 lg:px-12 lg:py-12 xl:px-16">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(249,115,22,0.2),transparent_50%)]" />
        <div className="pointer-events-none absolute -right-20 bottom-0 h-64 w-64 rounded-full bg-brand-500/10 blur-3xl" />

        {/* Column, not two inline-flex links in a row: they used to share a
            line on small screens and the logo overlapped "Back to store".
            Brand first, the way back underneath it. */}
        <div className="relative flex flex-col items-start gap-3">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-amber-400 text-lg font-black text-white shadow-lg shadow-orange-950/40">
              E
            </span>
            <span className="text-xl font-semibold text-white">Ecommerce</span>
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-zinc-400 transition hover:text-white lg:hidden"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to store
          </Link>
        </div>

        <div className="relative mt-8 lg:mt-0 lg:flex lg:flex-1 lg:flex-col lg:justify-center">
          <h1 className="max-w-md text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl">
            {isLogin ? "Welcome back" : "Create your account"}
          </h1>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-zinc-400 sm:text-base">
            {isLogin
              ? "Sign in to access your cart, orders, and personalized shopping."
              : "Join in minutes — shop smarter with saved details and faster checkout."}
          </p>
          <ul className="mt-8 hidden space-y-3 sm:block lg:mt-10">
            {highlights.map((item) => (
              <li key={item} className="flex items-center gap-3 text-sm text-zinc-300">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-500/20 text-brand-400">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative mt-8 hidden text-xs text-zinc-500 lg:block">
          &copy; {new Date().getFullYear()} Ecommerce. All rights reserved.
        </p>
      </aside>

      {/* Right — form area */}
      <div className="relative flex min-h-[50vh] flex-col overflow-y-auto bg-surface lg:min-h-screen lg:max-h-screen">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(249,115,22,0.06),transparent_45%)]"
          aria-hidden
        />
        <div className="relative flex flex-1 flex-col justify-center px-4 py-10 sm:px-8 sm:py-12 lg:px-12 lg:py-16 xl:px-20">
          <div className="mx-auto w-full max-w-[440px]">{children}</div>
        </div>
      </div>
    </div>
  );
}
