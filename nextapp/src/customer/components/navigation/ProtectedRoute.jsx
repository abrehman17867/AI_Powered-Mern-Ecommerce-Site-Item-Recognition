"use client";

import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "@/lib/navigation";

export default function ProtectedRoute({ children }) {
  const location = useLocation();
  // localStorage is unavailable during Next's server render, so the auth check
  // is deferred to the client after hydration.
  const [jwt, setJwt] = useState(undefined);

  useEffect(() => {
    setJwt(localStorage.getItem("jwt"));
  }, []);

  if (jwt === undefined) {
    return null;
  }

  if (!jwt) {
    return (
      <Navigate
        to="/"
        replace
        state={{ showAuth: true, from: location.pathname }}
      />
    );
  }

  return children;
}
