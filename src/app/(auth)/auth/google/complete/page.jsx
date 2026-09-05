"use client";

import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "@/lib/navigation";
import { getUser } from "@/State/Auth/Action";
import { getCart } from "@/State/Cart/Action";
import LoadingState from "@/components/ui/LoadingState";
import EmptyState from "@/components/ui/EmptyState";

/**
 * Landing point for the Google callback.
 *
 * The token arrives in the URL fragment, which the browser never sends to a
 * server. This reads it, stores it the same way a password login does, wipes
 * the fragment from the address bar and history, then continues to wherever
 * the shopper started.
 */
export default function GoogleCompletePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    const params = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const token = params.get("token");
    const from = params.get("from") || "/";

    // Drop the token from the address bar before anything else can read it.
    window.history.replaceState(null, "", window.location.pathname);

    if (!token) {
      setError("Sign-in did not complete. Please try again.");
      return;
    }

    localStorage.setItem("jwt", token);

    (async () => {
      try {
        await dispatch(getUser(token, { silent: false }));
        await dispatch(getCart({ silent: true }));
        navigate(from.startsWith("/") ? from : "/", { replace: true });
      } catch {
        setError("Signed in, but your profile could not be loaded.");
      }
    })();
  }, [dispatch, navigate]);

  if (error) {
    return (
      <div className="py-16">
        <EmptyState
          title="Google sign-in problem"
          description={error}
          actionLabel="Back to sign in"
          onAction={() => navigate("/login", { replace: true })}
        />
      </div>
    );
  }

  return (
    <div className="py-16">
      <LoadingState label="Finishing sign-in…" />
    </div>
  );
}
