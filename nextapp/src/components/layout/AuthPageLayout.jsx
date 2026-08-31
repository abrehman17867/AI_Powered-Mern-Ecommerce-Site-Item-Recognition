"use client";

import React from "react";

/** Login / register — full viewport, no storefront nav or footer */
const AuthPageLayout = ({ children }) => (
  <div className="min-h-screen bg-surface-muted text-foreground">
    {children}
  </div>
);

export default AuthPageLayout;
