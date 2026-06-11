import React from "react";
import { Outlet } from "react-router-dom";

/** Login / register — full viewport, no storefront nav or footer */
const AuthPageLayout = () => (
  <div className="min-h-screen bg-surface-muted text-foreground">
    <Outlet />
  </div>
);

export default AuthPageLayout;
