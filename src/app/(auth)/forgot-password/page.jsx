"use client";

import React, { useState } from "react";
import { Link, useNavigate } from "@/lib/navigation";
import { ArrowLeftIcon, EnvelopeIcon } from "@heroicons/react/24/outline";
import AuthShell from "@/customer/Auth/AuthShell";
import AuthFormPanel from "@/customer/Auth/AuthFormPanel";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { api } from "@/config/apiConfig";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [sentTo, setSentTo] = useState(null);

  const submit = async (event) => {
    event.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const { data } = await api.post("/api/auth/forgot-password", { email });
      // The reply is identical for registered and unregistered addresses, so
      // this screen must not imply the account exists.
      setSentTo(data?.message ? email.trim() : email.trim());
    } catch (err) {
      setError(err?.response?.data?.error || "Could not send the reset email.");
    } finally {
      setBusy(false);
    }
  };

  const footer = (
    <p className="text-sm text-foreground-muted">
      Remembered it?{" "}
      <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700">
        Back to sign in
      </Link>
    </p>
  );

  return (
    <AuthShell mode="login">
      {sentTo ? (
        <AuthFormPanel
          eyebrow="Account"
          title="Check your email"
          subtitle={`If an account exists for ${sentTo}, we've sent a link to reset your password.`}
          footer={footer}
        >
          <div className="rounded-2xl border border-line bg-surface-muted/50 p-5">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
              <EnvelopeIcon className="h-5 w-5" />
            </span>
            <p className="mt-4 text-sm leading-relaxed text-foreground-muted">
              The link expires in 60 minutes and can only be used once. If it does not
              arrive within a few minutes, check your spam folder.
            </p>
          </div>
          <Button
            variant="secondary"
            className="mt-4 w-full justify-center"
            onClick={() => {
              setSentTo(null);
              setEmail("");
            }}
          >
            Use a different email
          </Button>
        </AuthFormPanel>
      ) : (
        <AuthFormPanel
          eyebrow="Account"
          title="Forgot your password?"
          subtitle="Enter the email you signed up with and we'll send you a reset link."
          error={error}
          footer={footer}
        >
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-foreground-muted transition hover:text-foreground"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to sign in
          </button>

          <form className="space-y-4" onSubmit={submit} noValidate>
            <Input
              label="Email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button
              type="submit"
              className="w-full !py-3"
              loading={busy}
              loadingLabel="Sending…"
            >
              Send reset link
            </Button>
          </form>
        </AuthFormPanel>
      )}
    </AuthShell>
  );
}
