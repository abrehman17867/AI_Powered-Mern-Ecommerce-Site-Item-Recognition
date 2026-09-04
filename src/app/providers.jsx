"use client";

import { Suspense } from "react";
import { Provider } from "react-redux";
import { store } from "@/State/store";
import AppToast from "@/components/AppToast";
import ClientOnly from "@/components/ClientOnly";
import AppBootSplash from "@/components/AppBootSplash";
import RouteProgress from "@/components/RouteProgress";

export default function Providers({ children }) {
  return (
    <Provider store={store}>
      <Suspense fallback={<AppBootSplash />}>
        <ClientOnly fallback={<AppBootSplash />}>{children}</ClientOnly>
      </Suspense>
      <Suspense fallback={null}>
        <RouteProgress />
      </Suspense>
      <AppToast />
    </Provider>
  );
}
