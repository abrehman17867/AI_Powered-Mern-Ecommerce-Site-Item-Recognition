"use client";

import { Suspense } from "react";
import { Provider } from "react-redux";
import { store } from "@/State/store";
import AppToast from "@/components/AppToast";
import ClientOnly from "@/components/ClientOnly";

export default function Providers({ children }) {
  return (
    <Provider store={store}>
      <Suspense fallback={null}>
        <ClientOnly>{children}</ClientOnly>
      </Suspense>
      <AppToast />
    </Provider>
  );
}
