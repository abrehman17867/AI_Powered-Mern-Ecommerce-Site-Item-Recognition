"use client";

import React from "react";
import { classNames } from "../../utils/classNames";

/**
 * Global content container — max-width 1200px, responsive horizontal padding.
 * Mobile: 12px | Tablet: 16px | Desktop: 24px
 */
const AppContainer = React.forwardRef(function AppContainer(
  { as: Component = "div", className, children, fluid = false, ...props },
  ref
) {
  return (
    <Component
      ref={ref}
      className={classNames(
        fluid ? "w-full" : "app-container",
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
});

AppContainer.displayName = "AppContainer";

export default AppContainer;
