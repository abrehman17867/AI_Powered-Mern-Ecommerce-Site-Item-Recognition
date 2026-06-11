import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { clearAuthError, register } from "../../State/Auth/Action";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import PasswordField from "./PasswordField";
import AuthFormPanel from "./AuthFormPanel";

function RegisterFormInner({ compact = false, onClose }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { auth } = useSelector((store) => store);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    mobile: "",
    streetAddress: "",
    city: "",
    state: "",
    zipCode: "",
  });

  const handleChange = (event) => {
    setFormData((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    dispatch(register(formData));
  };

  useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  useEffect(() => {
    if (!auth.user) return;
    onClose?.();
    navigate("/", { replace: true });
  }, [auth.user, navigate, onClose]);

  const switchLogin = (e) => {
    e.preventDefault();
    onClose?.();
    navigate("/login");
  };

  const footer = (
    <p className="text-sm text-foreground-muted">
      Already have an account?{" "}
      <Link
        to="/login"
        onClick={switchLogin}
        className="font-semibold text-brand-600 hover:text-brand-700"
      >
        Sign in
      </Link>
    </p>
  );

  return (
    <AuthFormPanel
      compact={compact}
      eyebrow={compact ? undefined : "New account"}
      title="Sign up"
      subtitle={compact ? undefined : "Create your profile to shop and track orders."}
      error={auth.error}
      footer={footer}
    >
      <form className="space-y-4" onSubmit={handleSubmit} noValidate>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="First name"
            name="firstName"
            required
            autoComplete="given-name"
            value={formData.firstName}
            onChange={handleChange}
          />
          <Input
            label="Last name"
            name="lastName"
            required
            autoComplete="family-name"
            value={formData.lastName}
            onChange={handleChange}
          />
        </div>

        <Input
          label="Email"
          name="email"
          type="email"
          required
          autoComplete="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="you@example.com"
        />

        <PasswordField
          label="Password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          autoComplete="new-password"
        />

        <Input
          label="Mobile"
          name="mobile"
          type="tel"
          required
          autoComplete="tel"
          value={formData.mobile}
          onChange={handleChange}
        />

        <Input
          label="Street address"
          name="streetAddress"
          required
          autoComplete="street-address"
          value={formData.streetAddress}
          onChange={handleChange}
        />

        <Input
          label="City"
          name="city"
          required
          autoComplete="address-level2"
          value={formData.city}
          onChange={handleChange}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="State" name="state" required value={formData.state} onChange={handleChange} />
          <Input
            label="ZIP code"
            name="zipCode"
            required
            autoComplete="postal-code"
            value={formData.zipCode}
            onChange={handleChange}
          />
        </div>

        <Button type="submit" className="w-full !py-3" disabled={auth.isLoading}>
          {auth.isLoading ? "Creating account…" : "Create account"}
        </Button>
      </form>
    </AuthFormPanel>
  );
}

export default function RegisterForm(props) {
  return <RegisterFormInner {...props} />;
}
