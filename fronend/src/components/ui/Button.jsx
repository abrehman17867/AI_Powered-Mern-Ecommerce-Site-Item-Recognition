import React from "react";
import { classNames } from "../../utils/classNames";
import { buttonLabel, buttonShell, buttonSizes } from "./buttonStyles";

/**
 * App-wide CTA. `primary` / `secondary` use orange fill with bordered hover invert.
 * Pass `surface="dark"` on dark backgrounds (e.g. navbar).
 */
const Button = React.forwardRef(function Button(
  {
    variant = "primary",
    size = "md",
    surface = "light",
    className,
    children,
    type = "button",
    ...rest
  },
  ref
) {
  const shell = buttonShell(variant, surface);
  const label = buttonLabel(variant);
  const sizeClass = buttonSizes[size] || buttonSizes.md;

  if (variant === "ghost") {
    return (
      <button
        ref={ref}
        type={type}
        className={classNames(shell, sizeClass, className)}
        {...rest}
      >
        {children}
      </button>
    );
  }

  return (
    <button
      ref={ref}
      type={type}
      className={classNames(shell, sizeClass, className)}
      {...rest}
    >
      <span className={label}>{children}</span>
    </button>
  );
});

Button.displayName = "Button";

export default Button;
