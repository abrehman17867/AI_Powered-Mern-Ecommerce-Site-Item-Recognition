import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ClipboardDocumentListIcon,
  KeyIcon,
  MapPinIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import { classNames } from "../../../utils/classNames";

function initials(user) {
  const a = (user?.firstName?.[0] ?? "").toUpperCase();
  const b = (user?.lastName?.[0] ?? "").toUpperCase();
  return `${a}${b}` || "?";
}

export default function AccountNav({ user, activeTab, onTabChange }) {
  const location = useLocation();
  const onProfile = location.pathname.includes("/account/profile");

  const tabs = [
    { id: "personal", label: "Personal info", icon: UserCircleIcon },
    { id: "address", label: "Address", icon: MapPinIcon },
    { id: "security", label: "Password", icon: KeyIcon },
  ];

  return (
    <aside className="space-y-4">
      <div className="rounded-2xl border border-line bg-gradient-to-br from-surface to-brand-50/30 p-5 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-500 text-lg font-bold text-white shadow-lg shadow-brand-500/25">
            {initials(user)}
          </div>
          <div className="min-w-0">
            <p className="truncate font-semibold text-foreground">
              {[user?.firstName, user?.lastName].filter(Boolean).join(" ")}
            </p>
            <p className="truncate text-sm text-foreground-muted">{user?.email}</p>
          </div>
        </div>
      </div>

      {onProfile ? (
        <nav className="rounded-2xl border border-line bg-surface p-2 shadow-sm">
          <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-foreground-muted">
            Settings
          </p>
          <ul className="space-y-0.5">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <li key={tab.id}>
                  <button
                    type="button"
                    onClick={() => onTabChange(tab.id)}
                    className={classNames(
                      "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition",
                      active
                        ? "bg-brand-600 text-white shadow-sm"
                        : "text-foreground-muted hover:bg-surface-muted hover:text-foreground"
                    )}
                  >
                    <Icon className="h-5 w-5 shrink-0" strokeWidth={1.75} />
                    {tab.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      ) : null}

      <nav className="rounded-2xl border border-line bg-surface p-2 shadow-sm">
        <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-foreground-muted">
          Account
        </p>
        <ul className="space-y-0.5">
          <li>
            <Link
              to={`/account/profile/${user?._id}`}
              className={classNames(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                onProfile
                  ? "bg-brand-50 text-brand-700"
                  : "text-foreground-muted hover:bg-surface-muted hover:text-foreground"
              )}
            >
              <UserCircleIcon className="h-5 w-5" strokeWidth={1.75} />
              My profile
            </Link>
          </li>
          <li>
            <Link
              to="/account/order"
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground-muted transition hover:bg-surface-muted hover:text-foreground"
            >
              <ClipboardDocumentListIcon className="h-5 w-5" strokeWidth={1.75} />
              My orders
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
}
