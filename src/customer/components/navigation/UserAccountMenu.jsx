"use client";

import React, { Fragment } from "react";
import { Menu, Transition } from "@headlessui/react";
import { useNavigate } from "@/lib/navigation";
import {
  ArrowRightOnRectangleIcon,
  ChevronDownIcon,
  ClipboardDocumentListIcon,
  Squares2X2Icon,
  ShoppingBagIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import { classNames } from "../../../utils/classNames";
import { useDispatch } from "react-redux";
import {
  isAdminUser,
  hasAdminRole,
  getUserRoles,
  getActiveRole,
  hasMultipleRoles,
  ROLE_LABELS,
} from "../../../utils/authRoles";
import { switchRole } from "../../../State/Auth/Action";

function userInitials(user) {
  const a = (user?.firstName?.[0] ?? "").toUpperCase();
  const b = (user?.lastName?.[0] ?? "").toUpperCase();
  return `${a}${b}` || "?";
}

function userDisplayName(user) {
  const name = [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim();
  return name || "My account";
}

const menuItemClass =
  "group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors";

/**
 * "Viewing as" control for accounts that hold more than one role.
 *
 * Shared by the desktop menu and the mobile drawer — it previously existed
 * only in the desktop menu, so on a phone there was no way to switch between
 * the customer and admin views at all.
 */
function RoleSwitcher({ user, switching, onSwitch, className }) {
  if (!hasMultipleRoles(user)) return null;
  return (
    <div className={className}>
      <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-zinc-400">
        Viewing as
      </p>
      <div className="flex gap-1.5" role="group" aria-label="Switch role">
        {getUserRoles(user).map((r) => {
          const isActive = getActiveRole(user) === r;
          return (
            <button
              key={r}
              type="button"
              disabled={isActive || switching}
              aria-pressed={isActive}
              onClick={(e) => {
                e.preventDefault();
                onSwitch(r);
              }}
              className={classNames(
                "flex-1 rounded-lg px-2.5 py-2 text-xs font-semibold transition-colors disabled:cursor-default",
                isActive
                  ? "bg-brand-600 text-white shadow-sm"
                  : "bg-zinc-100 text-zinc-600 hover:bg-orange-100 hover:text-orange-700",
                switching && !isActive && "opacity-60"
              )}
            >
              {ROLE_LABELS[r] || r}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Role switching is identical wherever it is offered. */
function useRoleSwitch(onStart) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [switching, setSwitching] = React.useState(false);

  const switchTo = async (role) => {
    if (switching) return;
    // Dismiss the drawer immediately. Switching often lands on the page you
    // are already on, so no navigation occurs to close it for you and the
    // panel just sits there over the result.
    onStart?.();
    setSwitching(true);
    try {
      const updated = await dispatch(switchRole(role));
      // The area you are in may no longer be reachable under the new role.
      navigate(String(updated?.role).toUpperCase() === "ADMIN" ? "/admin" : "/");
    } catch {
      /* server rejected the switch; the caller keeps the current role */
    } finally {
      setSwitching(false);
    }
  };

  return { switching, switchTo };
}

function buildMenuItems({ user, context, navigate, switchTo }) {
  const items = [
    {
      key: "profile",
      label: "Profile",
      description: "Personal details & addresses",
      icon: UserCircleIcon,
      onClick: () =>
        navigate(context === "admin" ? "/admin/profile" : `/account/profile/${user._id}`),
    },
    {
      key: "orders",
      label: "My orders",
      description: "Track purchases & history",
      icon: ClipboardDocumentListIcon,
      onClick: () => navigate("/account/order"),
    },
  ];

  // Entitlement, not the active role: a multi-role user acting as a customer
  // still needs a way back to the admin area. Previously this used
  // isAdminUser(), so switching to Customer hid the entry entirely and the
  // role switcher became the only route back.
  if (hasAdminRole(user)) {
    if (context === "admin") {
      items.push({
        key: "customer-dashboard",
        label: "Customer dashboard",
        description: "Browse the storefront as a shopper",
        icon: ShoppingBagIcon,
        // The admin guard only admits an ACTIVE admin, so entering the other
        // area has to flip the role too, otherwise the guard bounces you
        // straight back out.
        onClick: () => (isAdminUser(user) ? switchTo("CUSTOMER") : navigate("/")),
        accent: "teal",
      });
    } else {
      items.push({
        key: "admin-dashboard",
        label: "Admin dashboard",
        description: "Manage products, orders & customers",
        icon: Squares2X2Icon,
        onClick: () => (isAdminUser(user) ? navigate("/admin") : switchTo("ADMIN")),
        accent: "teal",
      });
    }
  }

  return items;
}

export default function UserAccountMenu({
  user,
  navOnLight = true,
  context = "storefront",
  desktopOnly = true,
  onLogout,
}) {
  const navigate = useNavigate();
  // Called before the early return below so hook order stays stable.
  const { switching, switchTo } = useRoleSwitch();

  if (!user?.firstName && !user?._id) return null;

  const items = buildMenuItems({ user, context, navigate, switchTo });
  const accountItems = items.filter((item) => !item.accent);
  const switchItem = items.find((item) => item.accent);

  return (
    <Menu as="div" className={classNames("relative", desktopOnly && "hidden lg:block")}>
      {({ open }) => (
        <>
          <Menu.Button
            className={classNames(
              "flex items-center gap-2 rounded-full py-1 pl-1 pr-2.5 outline-none transition duration-200",
              "focus-visible:ring-2 focus-visible:ring-orange-500/60 focus-visible:ring-offset-2",
              navOnLight
                ? "bg-zinc-100/80 hover:bg-zinc-100 focus-visible:ring-offset-white"
                : "bg-white/10 hover:bg-white/15 focus-visible:ring-offset-zinc-950",
              open &&
                (navOnLight
                  ? "bg-zinc-100 ring-2 ring-orange-500/25"
                  : "bg-white/15 ring-2 ring-white/20")
            )}
            aria-label="Account menu"
          >
            <span
              className={classNames(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 via-orange-400 to-amber-400 text-xs font-bold text-white shadow-md shadow-orange-900/25",
                context === "admin" && "from-brand-600 via-brand-500 to-amber-500 shadow-brand-900/25"
              )}
            >
              {userInitials(user)}
            </span>
            <span
              className={classNames(
                "hidden max-w-[7rem] truncate text-sm font-semibold xl:inline",
                navOnLight ? "text-zinc-800" : "text-white"
              )}
            >
              {user.firstName}
            </span>
            <ChevronDownIcon
              className={classNames(
                "h-4 w-4 shrink-0 transition-transform duration-200",
                navOnLight ? "text-zinc-500" : "text-zinc-300",
                open && "rotate-180"
              )}
              aria-hidden
            />
          </Menu.Button>

          <Transition
            as={Fragment}
            enter="transition ease-out duration-200"
            enterFrom="opacity-0 translate-y-1 scale-95"
            enterTo="opacity-100 translate-y-0 scale-100"
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100 translate-y-0 scale-100"
            leaveTo="opacity-0 translate-y-1 scale-95"
          >
            <Menu.Items className="absolute right-0 z-[80] mt-2 w-72 origin-top-right overflow-hidden rounded-2xl border border-zinc-200/90 bg-white shadow-xl shadow-zinc-900/10 ring-1 ring-black/5 focus:outline-none">
              <div className="border-b border-zinc-100 bg-gradient-to-br from-zinc-50 to-white px-4 py-4">
                <div className="flex items-center gap-3">
                  <span
                    className={classNames(
                      "flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 via-orange-400 to-amber-400 text-sm font-bold text-white shadow-md",
                      context === "admin" && "from-brand-600 via-brand-500 to-amber-500"
                    )}
                  >
                    {userInitials(user)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-sm font-semibold text-zinc-900">
                        {userDisplayName(user)}
                      </p>
                      {isAdminUser(user) ? (
                        <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-700 ring-1 ring-brand-200/80">
                          Admin
                        </span>
                      ) : null}
                    </div>
                    {user.email ? (
                      <p className="truncate text-xs text-zinc-500">{user.email}</p>
                    ) : null}
                  </div>
                </div>
              </div>

              <RoleSwitcher
                user={user}
                switching={switching}
                onSwitch={switchTo}
                className="border-b border-zinc-100 px-4 py-3"
              />

              <div className="p-2">
                {accountItems.map((item) => (
                  <Menu.Item key={item.key}>
                    {({ active }) => (
                      <button
                        type="button"
                        onClick={item.onClick}
                        className={classNames(
                          menuItemClass,
                          active ? "bg-orange-50 text-zinc-900" : "text-zinc-700"
                        )}
                      >
                        <span
                          className={classNames(
                            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors",
                            active
                              ? "bg-orange-100 text-orange-600"
                              : "bg-zinc-100 text-zinc-600 group-hover:bg-orange-100 group-hover:text-orange-600"
                          )}
                        >
                          <item.icon className="h-5 w-5" aria-hidden />
                        </span>
                        <span className="min-w-0">
                          <span className="block font-semibold">{item.label}</span>
                          <span className="block text-xs font-normal text-zinc-500">
                            {item.description}
                          </span>
                        </span>
                      </button>
                    )}
                  </Menu.Item>
                ))}
              </div>

              {switchItem ? (
                <div className="border-t border-zinc-100 p-2">
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        type="button"
                        onClick={switchItem.onClick}
                        className={classNames(
                          menuItemClass,
                          active ? "bg-brand-50 text-brand-900" : "text-brand-800"
                        )}
                      >
                        <span
                          className={classNames(
                            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                            active ? "bg-brand-100 text-brand-700" : "bg-brand-50 text-brand-600"
                          )}
                        >
                          <switchItem.icon className="h-5 w-5" aria-hidden />
                        </span>
                        <span className="min-w-0">
                          <span className="block font-semibold">{switchItem.label}</span>
                          <span className="block text-xs font-normal text-brand-600/80">
                            {switchItem.description}
                          </span>
                        </span>
                      </button>
                    )}
                  </Menu.Item>
                </div>
              ) : null}

              <div className="border-t border-zinc-100 p-2">
                <Menu.Item>
                  {({ active }) => (
                    <button
                      type="button"
                      onClick={onLogout}
                      className={classNames(
                        menuItemClass,
                        active ? "bg-red-50 text-red-700" : "text-red-600"
                      )}
                    >
                      <span
                        className={classNames(
                          "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                          active ? "bg-red-100 text-red-600" : "bg-red-50 text-red-500"
                        )}
                      >
                        <ArrowRightOnRectangleIcon className="h-5 w-5" aria-hidden />
                      </span>
                      <span className="min-w-0">
                        <span className="block font-semibold">Sign out</span>
                        <span className="block text-xs font-normal text-red-500/80">
                          Log out of your account
                        </span>
                      </span>
                    </button>
                  )}
                </Menu.Item>
              </div>
            </Menu.Items>
          </Transition>
        </>
      )}
    </Menu>
  );
}

/** Mobile drawer account block — same actions, stacked layout */
export function UserAccountMobileLinks({
  user,
  context = "storefront",
  onNavigate,
  onLogout,
  onClose,
}) {
  // Before the early return so hook order stays stable.
  const { switching, switchTo } = useRoleSwitch(onClose);

  if (!user?._id) return null;

  const linkClass =
    "flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-gray-900 transition-colors hover:bg-orange-50 hover:text-orange-700";

  const switchLinkClass =
    "flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-brand-800 transition-colors hover:bg-brand-50 hover:text-brand-900";

  const items = buildMenuItems({
    user,
    context,
    navigate: (path) => onNavigate(path),
    switchTo,
  });
  const accountItems = items.filter((item) => !item.accent);
  const switchItem = items.find((item) => item.accent);

  return (
    <div className="space-y-1 border-b border-gray-200 px-4 pb-5 pt-2">
      <div className="mb-4 flex items-center gap-3 rounded-xl bg-zinc-50 px-3 py-3">
        <span
          className={classNames(
            "flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-amber-400 text-sm font-bold text-white",
            context === "admin" && "from-brand-600 to-amber-500"
          )}
        >
          {userInitials(user)}
        </span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate font-semibold text-zinc-900">{userDisplayName(user)}</p>
            {isAdminUser(user) ? (
              <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-bold uppercase text-brand-700">
                Admin
              </span>
            ) : null}
          </div>
          {user.email ? (
            <p className="truncate text-xs text-zinc-500">{user.email}</p>
          ) : null}
        </div>
      </div>

      <RoleSwitcher
        user={user}
        switching={switching}
        onSwitch={switchTo}
        className="mb-4 rounded-xl bg-white px-3 py-3 ring-1 ring-zinc-100"
      />

      {accountItems.map((item) => (
        <button
          key={item.key}
          type="button"
          className={linkClass}
          onClick={item.onClick}
        >
          <item.icon className="h-5 w-5 text-zinc-500" aria-hidden />
          {item.label}
        </button>
      ))}

      {switchItem ? (
        <button
          type="button"
          className={switchLinkClass}
          disabled={switching}
          onClick={switchItem.onClick}
        >
          <switchItem.icon className="h-5 w-5 text-brand-600" aria-hidden />
          {switchItem.label}
        </button>
      ) : null}

      <button
        type="button"
        className={classNames(linkClass, "text-red-600 hover:bg-red-50 hover:text-red-700")}
        onClick={onLogout}
      >
        <ArrowRightOnRectangleIcon className="h-5 w-5" aria-hidden />
        Sign out
      </button>
    </div>
  );
}
