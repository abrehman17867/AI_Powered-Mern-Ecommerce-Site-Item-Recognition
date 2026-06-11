import React from "react";
import { Outlet } from "react-router-dom";
import Navigation from "../../customer/components/navigation/Navigation";
import Footer from "../../customer/components/Footer/Footer";
import CartSync from "./CartSync";

const CustomerLayout = () => (
  <div className="flex min-h-screen flex-col bg-surface-muted text-foreground">
    <CartSync />
    <Navigation />
    <main className="flex-1 overflow-x-hidden">
      <Outlet />
    </main>
    <Footer />
  </div>
);

export default CustomerLayout;
