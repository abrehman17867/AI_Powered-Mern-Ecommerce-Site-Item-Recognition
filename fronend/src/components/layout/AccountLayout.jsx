import React from "react";
import { Outlet } from "react-router-dom";
import AccountNavigation from "../../customer/components/navigation/AccountNavigation";
import Footer from "../../customer/components/Footer/Footer";
import CartSync from "./CartSync";

/** Account area — profile, orders (no storefront categories mega menu). */
const AccountLayout = () => (
  <div className="flex min-h-screen flex-col bg-surface-muted text-foreground">
    <CartSync />
    <AccountNavigation />
    <main className="flex-1 overflow-x-hidden pt-[5.5rem] sm:pt-[6rem]">
      <Outlet />
    </main>
    <Footer />
  </div>
);

export default AccountLayout;
