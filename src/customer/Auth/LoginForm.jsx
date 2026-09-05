"use client";

import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "@/lib/navigation";
import { useDispatch, useSelector } from "react-redux";
import { clearAuthError, login } from "../../State/Auth/Action";
import { isAdminUser } from "../../utils/authRoles";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import PasswordField from "./PasswordField";
import AuthFormPanel from "./AuthFormPanel";
import GoogleSignInButton from "./GoogleSignInButton";

export default function LoginForm({ compact = false, onClose }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { auth } = useSelector((store) => store);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [remember, setRemember] = useState(false);

  const [oauthError, setOauthError] = useState(null);

  useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  // The Google callback redirects here with ?auth_error=… when it cannot
  // complete; show it and drop it from the URL so a refresh does not repeat it.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const message = params.get("auth_error");
    if (!message) return;
    setOauthError(message);
    params.delete("auth_error");
    const qs = params.toString();
    window.history.replaceState(null, "", window.location.pathname + (qs ? `?${qs}` : ""));
  }, []);

  const handleChange = (event) => {
    setFormData((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    dispatch(login(formData));
  };

  useEffect(() => {
    if (!auth.user) return;
    onClose?.();
    const from = location.state?.from;
    if (from && typeof from === "string") {
      navigate(from, { replace: true });
    } else if (isAdminUser(auth.user)) {
      navigate("/admin", { replace: true });
    } else {
      navigate("/", { replace: true });
    }
  }, [auth.user, location.state?.from, navigate, onClose]);

  const switchRegister = (e) => {
    e.preventDefault();
    onClose?.();
    navigate("/register");
  };

  const footer = (
    <p className="text-sm text-foreground-muted">
      Don&apos;t have an account?{" "}
      <Link
        to="/register"
        onClick={switchRegister}
        className="font-semibold text-brand-600 hover:text-brand-700"
      >
        Sign up
      </Link>
    </p>
  );

  return (
    <AuthFormPanel
      compact={compact}
      eyebrow={compact ? undefined : "Account"}
      title="Sign in"
      subtitle={compact ? undefined : "Enter your email and password to continue."}
      error={auth.error || oauthError}
      footer={footer}
    >
      {/* Google first: it is the fastest path and needs no typing. */}
      <GoogleSignInButton />

      <div className="my-5 flex items-center gap-3" aria-hidden="true">
        <span className="h-px flex-1 bg-line" />
        <span className="text-xs font-medium uppercase tracking-wide text-foreground-subtle">
          or
        </span>
        <span className="h-px flex-1 bg-line" />
      </div>

      <form className="space-y-4" onSubmit={handleSubmit} noValidate>
        <Input
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={formData.email}
          onChange={handleChange}
          placeholder="you@example.com"
        />
        <PasswordField
          name="password"
          value={formData.password}
          onChange={handleChange}
          autoComplete="current-password"
        />

        <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center sm:justify-between">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-foreground-muted">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="h-4 w-4 rounded border-line text-brand-600 focus:ring-brand-500/30"
            />
            Remember me
          </label>
          <button
            type="button"
            className="text-left text-sm font-medium text-brand-600 hover:text-brand-700 sm:text-right"
          >
            Forgot password?
          </button>
        </div>

        <Button
          type="submit"
          className="w-full !py-3"
          loading={auth.isLoading}
          loadingLabel="Signing in…"
        >
          Sign in
        </Button>
      </form>
    </AuthFormPanel>
  );
}
