"use client";

import React from "react";
import Navigation from "../../customer/components/navigation/Navigation";
import Footer from "../../customer/components/Footer/Footer";
import CartSync from "./CartSync";

const CustomerLayout = ({ children }) => (
  <div className="flex min-h-screen flex-col bg-surface-muted text-foreground">
    <CartSync />
    <Navigation />
    <main className="flex-1 overflow-x-hidden">
      {children}
    </main>
    <Footer />
  </div>
);

export default CustomerLayout;
