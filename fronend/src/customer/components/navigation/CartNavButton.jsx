import React from "react";
import { ShoppingBagIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import { classNames } from "../../../utils/classNames";
import { useCartCount } from "../../../hooks/useCartCount";
import CartBadge from "./CartBadge";

/**
 * Navbar / header cart control with live Redux-backed count.
 */
export default function CartNavButton({
  navOnLight = true,
  active = false,
  className,
  iconClassName = "h-5 w-5",
}) {
  const navigate = useNavigate();
  const count = useCartCount();
  const surface = navOnLight ? "light" : "dark";

  return (
    <button
      type="button"
      onClick={() => navigate("/cart")}
      aria-label={count > 0 ? `Shopping cart, ${count} items` : "Shopping cart"}
      aria-current={active ? "page" : undefined}
      className={classNames(
        "relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
        "transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/50 active:scale-[0.97]",
        navOnLight
          ? "text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 focus-visible:ring-offset-white"
          : "text-zinc-200 hover:bg-white/10 hover:text-white focus-visible:ring-offset-zinc-950",
        active &&
          (navOnLight ? "text-orange-600 hover:text-orange-700" : "text-orange-400 hover:text-orange-300"),
        className
      )}
    >
      <ShoppingBagIcon className={classNames("shrink-0", iconClassName)} aria-hidden />
      <CartBadge count={count} surface={surface} />
    </button>
  );
}
