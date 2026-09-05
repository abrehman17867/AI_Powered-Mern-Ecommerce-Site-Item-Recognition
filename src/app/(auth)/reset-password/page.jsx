"use client";

import React, { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "@/lib/navigation";
import { CheckCircleIcon } from "@heroicons/react/24/outline";
import AuthShell from "@/customer/Auth/AuthShell";
import AuthFormPanel from "@/customer/Auth/AuthFormPanel";
import PasswordField from "@/customer/Auth/PasswordField";
import Button from "@/components/ui/Button";
import LoadingState from "@/components/ui/LoadingState";
import { api } from "@/config/apiConfig";

const MIN_LENGTH = 6;

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams?.get("token") || "";
  const email = searchParams?.get("email") || "";

  // Checked before showing the form, so a dead link says so immediately
  // instead of after the shopper has typed a new password twice.
  const [checking, setChecking] = useState(true);
  const [linkValid, setLinkValid] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!token || !email) {
      setChecking(false);
      setLinkValid(false);
      return undefined;
    }
    api
      .get("/api/auth/reset-password", { params: { token, email } })
      .then(({ data }) => {
        if (!cancelled) setLinkValid(Boolean(data?.valid));
      })
      .catch(() => {
        if (!cancelled) setLinkValid(false);
      })
      .finally(() => {
        if (!cancelled) setChecking(false);
      });
    return () => {
      cancelled = true;
    };
  }, [token, email]);

  const submit = async (event) => {
    event.preventDefault();
    setError(null);

    if (password.length < MIN_LENGTH) {
      setError(`Password must be at least ${MIN_LENGTH} characters.`);
      return;
    }
    if (password !== confirm) {
      setError("Both passwords must match.");
      return;
    }

    setBusy(true);
    try {
      await api.post("/api/auth/reset-password", { token, email, password });
      setDone(true);
    } catch (err) {
      setError(err?.response?.data?.error || "Could not reset your password.");
    } finally {
      setBusy(false);
    }
  };

  const footer = (
    <p className="text-sm text-foreground-muted">
      <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700">
        Back to sign in
      </Link>
    </p>
  );

  return (
    <AuthShell mode="login">
      {checking ? (
        <AuthFormPanel eyebrow="Account" title="Checking your link…">
          <LoadingState minHeight="min-h-[12rem]" label="Verifying reset link…" />
        </AuthFormPanel>
      ) : done ? (
        <AuthFormPanel
          eyebrow="Account"
          title="Password updated"
          subtitle="You can now sign in with your new password."
          footer={footer}
        >
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <CheckCircleIcon className="h-6 w-6" />
            </span>
            <p className="mt-4 text-sm leading-relaxed text-emerald-900">
              Your password has been changed. The reset link has been used and will not
              work again.
            </p>
          </div>
          <Button className="mt-4 w-full justify-center !py-3" onClick={() => navigate("/login")}>
            Go to sign in
          </Button>
        </AuthFormPanel>
      ) : !linkValid ? (
        <AuthFormPanel
          eyebrow="Account"
          title="This link is no longer valid"
          subtitle="Reset links expire after 60 minutes and can only be used once."
          footer={footer}
        >
          <Button
            className="w-full justify-center !py-3"
            onClick={() => navigate("/forgot-password")}
          >
            Request a new link
          </Button>
        </AuthFormPanel>
      ) : (
        <AuthFormPanel
          eyebrow="Account"
          title="Choose a new password"
          subtitle={email ? `Resetting the password for ${email}.` : undefined}
          error={error}
          footer={footer}
        >
          <form className="space-y-4" onSubmit={submit} noValidate>
            <PasswordField
              label="New password"
              name="password"
              required
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <PasswordField
              label="Confirm new password"
              name="confirmPassword"
              required
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
            <Button
              type="submit"
              className="w-full !py-3"
              loading={busy}
              loadingLabel="Updating…"
            >
              Reset password
            </Button>
          </form>
        </AuthFormPanel>
      )}
    </AuthShell>
  );
}
