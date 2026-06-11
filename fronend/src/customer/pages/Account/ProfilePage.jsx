import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  CalendarDaysIcon,
  EnvelopeIcon,
  PhoneIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import PageLayout from "../../../components/layout/PageLayout";
import LoadingState from "../../../components/ui/LoadingState";
import Input from "../../../components/ui/Input";
import Button from "../../../components/ui/Button";
import PasswordField from "../../Auth/PasswordField";
import AccountNav from "../../components/Account/AccountNav";
import { changePassword, getUser, updateUserProfile } from "../../../State/Auth/Action";
import { classNames } from "../../../utils/classNames";

function memberSince(user) {
  const raw = user?.createAt || user?.createdAt;
  if (!raw) return "—";
  return new Date(raw).toLocaleDateString(undefined, { month: "long", year: "numeric" });
}

function primaryAddress(user) {
  const list = user?.address;
  if (!list?.length) return null;
  const a = list[0];
  return typeof a === "object" ? a : null;
}

function SectionCard({ title, description, children, footer }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-line bg-surface shadow-sm">
      <div className="border-b border-line/60 px-6 py-5">
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        {description ? <p className="mt-1 text-sm text-foreground-muted">{description}</p> : null}
      </div>
      <div className="px-6 py-6">{children}</div>
      {footer ? <div className="border-t border-line/60 bg-surface-muted/40 px-6 py-4">{footer}</div> : null}
    </section>
  );
}

const TABS = [
  { id: "personal", label: "Personal" },
  { id: "address", label: "Address" },
  { id: "security", label: "Password" },
];

export default function ProfilePage({ adminShell = false }) {
  const { userId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isLoading } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState("personal");
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const addr = useMemo(() => primaryAddress(user), [user]);

  const [profileForm, setProfileForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobile: "",
  });

  const [addressForm, setAddressForm] = useState({
    streetAddress: "",
    city: "",
    state: "",
    zipCode: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    const jwt = localStorage.getItem("jwt");
    if (!jwt) {
      navigate("/login", { replace: true });
      return;
    }
    dispatch(getUser(jwt));
  }, [dispatch, navigate]);

  useEffect(() => {
    if (!user?._id) return;
    if (!adminShell && String(user._id) !== String(userId)) {
      navigate(`/account/profile/${user._id}`, { replace: true });
      return;
    }
    setProfileForm({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      email: user.email || "",
      mobile: user.mobile || "",
    });
    const a = primaryAddress(user);
    setAddressForm({
      streetAddress: a?.streetAddress || "",
      city: a?.city || "",
      state: a?.state || "",
      zipCode: a?.zipCode != null ? String(a.zipCode) : "",
    });
  }, [user, userId, navigate, adminShell]);

  const handleProfileChange = (e) => {
    setProfileForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAddressChange = (e) => {
    setAddressForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePasswordChange = (e) => {
    setPasswordForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    const result = await dispatch(
      updateUserProfile(user._id, {
        firstName: profileForm.firstName,
        lastName: profileForm.lastName,
        email: profileForm.email,
        mobile: profileForm.mobile,
      })
    );
    setSavingProfile(false);
    if (result?.success) toast.success("Profile updated");
    else toast.error(result?.error || "Could not update profile");
  };

  const saveAddress = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    const result = await dispatch(
      updateUserProfile(user._id, {
        address: {
          firstName: profileForm.firstName,
          lastName: profileForm.lastName,
          streetAddress: addressForm.streetAddress,
          city: addressForm.city,
          state: addressForm.state,
          zipCode: addressForm.zipCode,
          mobile: profileForm.mobile,
        },
      })
    );
    setSavingProfile(false);
    if (result?.success) toast.success("Address saved");
    else toast.error(result?.error || "Could not save address");
  };

  const savePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setSavingPassword(true);
    const result = await dispatch(
      changePassword(user._id, {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      })
    );
    setSavingPassword(false);
    if (result?.success) {
      toast.success("Password updated");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } else {
      toast.error(result?.error || "Could not update password");
    }
  };

  if (isLoading && !user) {
    if (adminShell) {
      return <LoadingState minHeight="min-h-[40vh]" label="Loading your profile…" />;
    }
    return (
      <PageLayout eyebrow="Account" title="My profile">
        <LoadingState minHeight="min-h-[40vh]" label="Loading your profile…" />
      </PageLayout>
    );
  }

  if (!user?._id) return null;

  const tabPills = (
    <div className={classNames("flex gap-2 overflow-x-auto pb-1", !adminShell && "lg:hidden")}>
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => setActiveTab(tab.id)}
          className={classNames(
            "shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition",
            activeTab === tab.id
              ? "bg-brand-600 text-white"
              : "border border-line bg-surface text-foreground-muted"
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );

  const profileBody = (
    <>
          {/* Hero summary */}
          <div className="relative overflow-hidden rounded-2xl border border-line bg-gradient-to-br from-zinc-900 via-zinc-800 to-brand-900 p-6 text-white shadow-lg sm:p-8">
            <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-brand-500/20 blur-3xl" />
            <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-5">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-2xl font-bold ring-1 ring-white/20 backdrop-blur">
                  {(user.firstName?.[0] || "").toUpperCase()}
                  {(user.lastName?.[0] || "").toUpperCase()}
                </div>
                <div>
                  <h2 className="text-xl font-semibold sm:text-2xl">
                    {[user.firstName, user.lastName].filter(Boolean).join(" ")}
                  </h2>
                  <p className="mt-1 text-sm text-zinc-300">{user.email}</p>
                  <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-medium ring-1 ring-white/15">
                    <ShieldCheckIcon className="h-3.5 w-3.5" />
                    {user.role === "ADMIN" ? "Admin account" : "Customer account"}
                  </span>
                </div>
              </div>
              <dl className="grid grid-cols-2 gap-4 sm:gap-6">
                <div className="rounded-xl bg-white/5 px-4 py-3 ring-1 ring-white/10">
                  <dt className="flex items-center gap-1.5 text-xs text-zinc-400">
                    <CalendarDaysIcon className="h-4 w-4" />
                    Member since
                  </dt>
                  <dd className="mt-1 text-sm font-semibold">{memberSince(user)}</dd>
                </div>
                <div className="rounded-xl bg-white/5 px-4 py-3 ring-1 ring-white/10">
                  <dt className="flex items-center gap-1.5 text-xs text-zinc-400">
                    <PhoneIcon className="h-4 w-4" />
                    Mobile
                  </dt>
                  <dd className="mt-1 text-sm font-semibold">{user.mobile || "—"}</dd>
                </div>
              </dl>
            </div>
          </div>

          {tabPills}

          {activeTab === "personal" ? (
            <SectionCard
              title="Personal information"
              description="Update your name, email, and contact number."
              footer={
                <div className="flex justify-end">
                  <Button type="submit" form="profile-form" disabled={savingProfile}>
                    {savingProfile ? "Saving…" : "Save changes"}
                  </Button>
                </div>
              }
            >
              <form id="profile-form" className="space-y-5" onSubmit={saveProfile}>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Input
                    label="First name"
                    name="firstName"
                    required
                    value={profileForm.firstName}
                    onChange={handleProfileChange}
                  />
                  <Input
                    label="Last name"
                    name="lastName"
                    required
                    value={profileForm.lastName}
                    onChange={handleProfileChange}
                  />
                </div>
                <Input
                  label="Email"
                  name="email"
                  type="email"
                  required
                  value={profileForm.email}
                  onChange={handleProfileChange}
                  hint="Used for order confirmations and sign-in"
                />
                <Input
                  label="Mobile"
                  name="mobile"
                  type="tel"
                  value={profileForm.mobile}
                  onChange={handleProfileChange}
                />
              </form>
            </SectionCard>
          ) : null}

          {activeTab === "address" ? (
            <SectionCard
              title="Delivery address"
              description="Your default shipping address for checkout."
              footer={
                <div className="flex justify-end">
                  <Button type="submit" form="address-form" disabled={savingProfile}>
                    {savingProfile ? "Saving…" : "Save address"}
                  </Button>
                </div>
              }
            >
              {addr ? (
                <div className="mb-6 flex items-start gap-3 rounded-xl border border-brand-200/60 bg-brand-50/40 px-4 py-3">
                  <EnvelopeIcon className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
                  <p className="text-sm text-foreground-muted">
                    <span className="font-medium text-foreground">Current: </span>
                    {addr.streetAddress}, {addr.city}, {addr.state} {addr.zipCode}
                  </p>
                </div>
              ) : null}
              <form id="address-form" className="space-y-5" onSubmit={saveAddress}>
                <Input
                  label="Street address"
                  name="streetAddress"
                  required
                  value={addressForm.streetAddress}
                  onChange={handleAddressChange}
                />
                <div className="grid gap-5 sm:grid-cols-2">
                  <Input
                    label="City"
                    name="city"
                    required
                    value={addressForm.city}
                    onChange={handleAddressChange}
                  />
                  <Input label="State" name="state" required value={addressForm.state} onChange={handleAddressChange} />
                </div>
                <Input
                  label="ZIP code"
                  name="zipCode"
                  required
                  value={addressForm.zipCode}
                  onChange={handleAddressChange}
                />
              </form>
            </SectionCard>
          ) : null}

          {activeTab === "security" ? (
            <SectionCard
              title="Change password"
              description="Use a strong password you don't use elsewhere."
              footer={
                <div className="flex justify-end">
                  <Button type="submit" form="password-form" disabled={savingPassword}>
                    {savingPassword ? "Updating…" : "Update password"}
                  </Button>
                </div>
              }
            >
              <form id="password-form" className="mx-auto max-w-md space-y-5" onSubmit={savePassword}>
                <PasswordField
                  label="Current password"
                  name="currentPassword"
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordChange}
                  autoComplete="current-password"
                />
                <PasswordField
                  label="New password"
                  name="newPassword"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordChange}
                  autoComplete="new-password"
                />
                <PasswordField
                  label="Confirm new password"
                  name="confirmPassword"
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordChange}
                  autoComplete="new-password"
                />
              </form>
            </SectionCard>
          ) : null}
    </>
  );

  if (adminShell) {
    return <div className="space-y-6">{profileBody}</div>;
  }

  return (
    <PageLayout
      eyebrow="Account"
      title="My profile"
      description="Manage your personal details, delivery address, and account security."
      actions={
        <Link
          to="/account/order"
          className="text-sm font-semibold text-brand-600 transition hover:text-brand-700"
        >
          View orders →
        </Link>
      }
    >
      <div className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-4 xl:col-span-3">
          <div className="lg:sticky lg:top-24">
            <AccountNav user={user} activeTab={activeTab} onTabChange={setActiveTab} />
          </div>
        </div>
        <div className="space-y-6 lg:col-span-8 xl:col-span-9">{profileBody}</div>
      </div>
    </PageLayout>
  );
}
