"use client";

import React from "react";
import { Link } from "@/lib/navigation";
import AppContainer from "../../../components/layout/AppContainer";
import { useCartCount } from "../../../hooks/useCartCount";

const columns = [
  {
    title: "Shop",
    links: [
      { label: "All products", to: "/products" },
      { label: "Cart", to: "/cart" },
      { label: "Contact", to: "/contact-us" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Orders", to: "/account/order" },
      { label: "Sign in", to: "/login" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", to: "/contact-us" },
      { label: "Support", to: "/contact-us" },
    ],
  },
];

const Footer = () => {
  const cartCount = useCartCount();

  return (
    <footer className="mt-auto border-t border-border bg-surface-inverse text-zinc-300">
      <AppContainer className="py-12 md:py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <Link to="/" className="inline-flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-amber-400 text-sm font-black text-white">
                E
              </span>
              <span className="text-lg font-semibold text-white">Ecommerce</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-zinc-400">
              Modern shopping with smart discovery, secure checkout, and order tracking.
            </p>
          </div>
          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
                {col.title}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-sm text-zinc-400 transition hover:text-white"
                    >
                      {link.to === "/cart" && cartCount > 0
                        ? `Cart (${cartCount})`
                        : link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-col gap-3 border-t border-zinc-800 pt-8 text-sm text-zinc-500 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} Ecommerce. All rights reserved.</p>
          <p className="text-zinc-600">Built for a consistent, responsive experience.</p>
        </div>
      </AppContainer>
    </footer>
  );
};

export default Footer;
