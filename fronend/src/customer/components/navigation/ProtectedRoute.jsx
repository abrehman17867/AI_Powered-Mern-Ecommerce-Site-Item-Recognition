import React from "react";
import { Navigate, useLocation } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const jwt = localStorage.getItem("jwt");
  const location = useLocation();

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
