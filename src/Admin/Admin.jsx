"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "@/lib/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  Bars3Icon,
  ChartBarSquareIcon,
  CubeIcon,
  PlusIcon,
  RectangleStackIcon,
  ShoppingBagIcon,
  UsersIcon,
  XMarkIcon,
  ArrowTopRightOnSquareIcon,
} from "@heroicons/react/24/outline";
import { getUser, logout } from "../State/Auth/Action";
import UserAccountMenu from "../customer/components/navigation/UserAccountMenu";
import { classNames } from "../utils/classNames";
import Button from "../components/ui/Button";
import LoadingState from "../components/ui/LoadingState";
import { isAdminUser } from "../utils/authRoles";
import "./admin.css";

const NAV = [
  { group: "Overview", items: [{ name: "Dashboard", path: "/admin", icon: ChartBarSquareIcon, end: true }] },
  {
    group: "Catalog",
    items: [
      { name: "Products", path: "/admin/products", icon: CubeIcon },
      { name: "Categories", path: "/admin/categories", icon: RectangleStackIcon },
      { name: "Add product", path: "/admin/product/create", icon: PlusIcon },
    ],
  },
  { group: "Sales", items: [{ name: "Orders", path: "/admin/orders", icon: ShoppingBagIcon }] },
  { group: "Customers", items: [{ name: "Customers", path: "/admin/customers", icon: UsersIcon }] },
];

function isActive(pathname, item) {
  const p = pathname.replace(/\/$/, "") || "/admin";
  if (item.end) return p === "/admin";
  return p === item.path || p.startsWith(`${item.path}/`);
}

function currentPage(pathname) {
  if (pathname.startsWith("/admin/profile")) {
    return { name: "Profile", path: "/admin/profile" };
  }
  for (const g of NAV) {
    const m = g.items.find((i) => isActive(pathname, i));
    if (m) return m;
  }
  return null;
}

function SidebarNav({ pathname, onNavigate, dark = true }) {
  return (
    <div className={dark ? "admin-sidebar-nav" : "flex-1 space-y-6 overflow-y-auto px-3 py-5"}>
      {NAV.map((group) => (
        <div key={group.group}>
          <p className={dark ? "admin-nav-label" : "mb-2 px-3 text-xs font-semibold uppercase text-foreground-muted"}>
            {group.group}
          </p>
          <nav className="space-y-0.5">
            {group.items.map((item) => {
              const active = isActive(pathname, item);
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={onNavigate}
                  className={classNames(
                    dark ? "admin-nav-link" : "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground-muted hover:bg-surface-muted",
                    active && (dark ? "admin-nav-link-active" : "bg-brand-50 text-brand-700")
                  )}
                >
                  <Icon className="h-5 w-5 shrink-0" strokeWidth={1.75} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      ))}
    </div>
  );
}

const Admin = ({ children }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, error: authError } = useSelector((store) => store.auth);

  // Track that the profile lookup has *finished*, rather than waiting for a
  // user object to appear. `getUser` is dispatched with `silent: true`, and on
  // any non-401 failure it deliberately dispatches nothing at all — no error,
  // no user, no loading change. Keying the guard off `user` alone therefore
  // left this screen stuck on "Checking access…" forever after a single failed
  // profile request, with no error and no way out but a manual refresh.
  const [profileChecked, setProfileChecked] = useState(false);

  const loadProfile = useCallback(() => {
    if (!localStorage.getItem("jwt")) {
      setProfileChecked(true);
      return Promise.resolve();
    }
    setProfileChecked(false);
    return Promise.resolve(dispatch(getUser(undefined, { silent: true }))).finally(() =>
      setProfileChecked(true)
    );
  }, [dispatch]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // Nothing here is usable without an admin session — every panel just 403s.
  // Wait until the profile check has settled before deciding, so a refresh
  // does not bounce a genuine admin out mid-fetch.
  const signedIn = typeof window !== "undefined" && Boolean(localStorage.getItem("jwt"));
  const authorized = isAdminUser(user);
  // The check ran, the token is still there, but no profile came back: the
  // request failed. Show a way out instead of spinning.
  const profileUnavailable = profileChecked && signedIn && !user?._id;

  useEffect(() => {
    if (!signedIn) {
      navigate("/login", { replace: true });
      return;
    }
    if (user?._id && !authorized) {
      navigate("/", { replace: true });
    }
  }, [signedIn, user?._id, authorized, navigate]);

  useEffect(() => setDrawerOpen(false), [location.pathname]);

  const page = useMemo(() => currentPage(location.pathname), [location.pathname]);

  const handleLogout = () => {
    dispatch(logout());
    localStorage.clear();
    navigate("/", { replace: true });
  };

  const closeDrawer = () => setDrawerOpen(false);

  const sidebarFooter = (
    <div className="shrink-0 border-t border-zinc-800 p-3">
      <Link to="/" className="admin-nav-link" onClick={closeDrawer}>
        <ArrowTopRightOnSquareIcon className="h-5 w-5 shrink-0" />
        View storefront
      </Link>
    </div>
  );

  // Hold the panels back until access is confirmed, otherwise they fire their
  // requests and the screen fills with 403 toasts before the redirect lands.
  if (profileUnavailable) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-6">
        <div className="w-full max-w-sm rounded-2xl border border-line bg-white p-6 text-center shadow-sm">
          <h1 className="text-base font-semibold text-foreground">
            Could not verify your session
          </h1>
          <p className="mt-2 text-sm text-foreground-muted">
            {authError ||
              "We could not load your admin profile. The server may be unreachable."}
          </p>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button type="button" onClick={loadProfile}>
              Try again
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                dispatch(logout());
                localStorage.clear();
                navigate("/login", { replace: true });
              }}
            >
              Sign in again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!signedIn || !authorized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50">
        <LoadingState
          minHeight="min-h-0"
          label={user?._id ? "Redirecting…" : "Checking access…"}
        />
      </div>
    );
  }

  return (
    <div className="admin-root">
      {/* Desktop sidebar — fixed full height */}
      <aside className="admin-sidebar hidden lg:flex">
        <div className="admin-sidebar-brand">
          <span className="admin-sidebar-brand-mark">S</span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">Store Admin</p>
            <p className="truncate text-xs text-zinc-500">Ecommerce control</p>
          </div>
        </div>
        <SidebarNav pathname={location.pathname} />
        {sidebarFooter}
      </aside>

      {/* Mobile drawer */}
      {drawerOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          aria-label="Close menu"
          onClick={closeDrawer}
        />
      ) : null}
      <aside
        className={classNames(
          "admin-drawer flex flex-col transition-transform duration-200 lg:hidden",
          drawerOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="admin-sidebar-brand">
          <span className="admin-sidebar-brand-mark">S</span>
          <p className="text-sm font-semibold text-white">Store Admin</p>
          <button type="button" onClick={closeDrawer} className="ml-auto rounded-lg p-2 text-zinc-400 hover:bg-zinc-900">
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
        <SidebarNav pathname={location.pathname} onNavigate={closeDrawer} />
        {sidebarFooter}
      </aside>

      {/* Main */}
      <div className="admin-main">
        <header className="admin-topbar">
          <div className="admin-content-inner flex h-14 items-center justify-between gap-4 sm:h-16">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                className="rounded-lg border border-line p-2 text-foreground-muted lg:hidden"
                onClick={() => setDrawerOpen(true)}
                aria-label="Open menu"
              >
                <Bars3Icon className="h-5 w-5" />
              </button>
              <div className="min-w-0">
                <p className="text-xs text-foreground-muted">Admin / {page?.name || "Dashboard"}</p>
                <h1 className="truncate text-lg font-semibold text-foreground sm:text-xl">
                  {page?.name || "Dashboard"}
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {user?._id ? (
                <UserAccountMenu user={user} context="admin" desktopOnly={false} onLogout={handleLogout} />
              ) : (
                <Link to="/login" className="rounded-lg border border-line px-3 py-2 text-sm font-medium">
                  Sign in
                </Link>
              )}
            </div>
          </div>
        </header>

        <main className="admin-content">
          <div className="admin-content-inner">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default Admin;
