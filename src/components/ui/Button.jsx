"use client";

import React from "react";
import { classNames } from "../../utils/classNames";
import { buttonLabel, buttonShell, buttonSizes } from "./buttonStyles";

const SPINNER_SIZE = {
  sm: "h-3 w-3",
  md: "h-3.5 w-3.5",
  lg: "h-4 w-4",
};

/**
 * App-wide CTA. `primary` / `secondary` use orange fill with bordered hover invert.
 * Pass `surface="dark"` on dark backgrounds (e.g. navbar).
 *
 * `loading` is the single busy affordance for the whole app: it shows a spinner,
 * blocks the click, and (with `loadingLabel`) swaps the text. Prefer it over a
 * hand-rolled `disabled={busy}` so every action button reads the same.
 */
const Button = React.forwardRef(function Button(
  {
    variant = "primary",
    size = "md",
    surface = "light",
    className,
    children,
    type = "button",
    loading = false,
    loadingLabel,
    disabled,
    ...rest
  },
  ref
) {
  const shell = buttonShell(variant, surface);
  const label = buttonLabel(variant);
  const sizeClass = buttonSizes[size] || buttonSizes.md;

  const spinner = loading ? (
    <span
      aria-hidden="true"
      className={classNames(
        "inline-block shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent",
        SPINNER_SIZE[size] || SPINNER_SIZE.md
      )}
    />
  ) : null;

  const content = (
    <>
      {spinner}
      {loading && loadingLabel ? loadingLabel : children}
    </>
  );

  const commonProps = {
    ref,
    type,
    disabled: disabled || loading,
    "aria-busy": loading || undefined,
    ...rest,
  };

  if (variant === "ghost") {
    return (
      <button {...commonProps} className={classNames(shell, sizeClass, className)}>
        {content}
      </button>
    );
  }

  return (
    <button {...commonProps} className={classNames(shell, sizeClass, className)}>
      <span className={label}>{content}</span>
    </button>
  );
});

Button.displayName = "Button";

export default Button;
