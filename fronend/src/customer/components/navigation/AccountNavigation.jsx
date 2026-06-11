import React, { Fragment, useEffect, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import {
  ArrowLeftIcon,
  Bars3Icon,
  ClipboardDocumentListIcon,
  ShoppingBagIcon,
  UserCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getUser, logout } from "../../../State/Auth/Action";
import { classNames } from "../../../utils/classNames";
import CartNavButton from "./CartNavButton";
import UserAccountMenu, { UserAccountMobileLinks } from "./UserAccountMenu";

const linkBase =
  "relative inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold transition-colors after:absolute after:bottom-0 after:left-1/2 after:h-0.5 after:w-[calc(100%-1rem)] after:-translate-x-1/2 after:rounded-full after:bg-brand-500 after:transition-transform after:content-['']";

function AccountNavLink({ to, active, children, icon: Icon, onClick }) {
  const className = classNames(
    linkBase,
    active
      ? "text-foreground after:scale-x-100"
      : "text-foreground-muted hover:text-foreground after:scale-x-0 hover:after:scale-x-100"
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={className}>
        {Icon ? <Icon className="h-4 w-4" strokeWidth={1.75} /> : null}
        {children}
      </button>
    );
  }

  return (
    <Link to={to} aria-current={active ? "page" : undefined} className={className}>
      {Icon ? <Icon className="h-4 w-4" strokeWidth={1.75} /> : null}
      {children}
    </Link>
  );
}

export default function AccountNavigation() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (localStorage.getItem("jwt")) {
      dispatch(getUser(undefined, { silent: true }));
    }
  }, [dispatch]);

  useEffect(() => setDrawerOpen(false), [location.pathname]);

  const onOrders = location.pathname.startsWith("/account/order");
  const onProfile = location.pathname.startsWith("/account/profile");
  const profilePath = user?._id ? `/account/profile/${user._id}` : "/login";

  const handleLogout = () => {
    dispatch(logout());
    localStorage.clear();
    navigate("/", { replace: true });
  };

  return (
    <>
      <Transition.Root show={drawerOpen} as={Fragment}>
        <Dialog as="div" className="relative z-[70] lg:hidden" onClose={setDrawerOpen}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/40" />
          </Transition.Child>
          <div className="fixed inset-0 flex justify-end">
            <Transition.Child
              as={Fragment}
              enter="transform transition ease-out duration-200"
              enterFrom="translate-x-full"
              enterTo="translate-x-0"
              leave="transform transition ease-in duration-150"
              leaveFrom="translate-x-0"
              leaveTo="translate-x-full"
            >
              <Dialog.Panel className="flex h-full w-[min(20rem,88vw)] flex-col bg-white shadow-xl">
                <div className="flex items-center justify-between border-b border-line px-4 py-4">
                  <p className="text-sm font-semibold text-foreground">My account</p>
                  <button
                    type="button"
                    onClick={() => setDrawerOpen(false)}
                    className="rounded-lg p-2 text-foreground-muted hover:bg-surface-muted"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                  <Link
                    to="/products"
                    onClick={() => setDrawerOpen(false)}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-foreground transition hover:bg-brand-50 hover:text-brand-700"
                  >
                    <ShoppingBagIcon className="h-5 w-5 text-brand-600" />
                    Continue shopping
                  </Link>
                </div>
                {user?._id ? (
                  <UserAccountMobileLinks
                    user={user}
                    onNavigate={(path) => {
                      setDrawerOpen(false);
                      navigate(path);
                    }}
                    onLogout={() => {
                      setDrawerOpen(false);
                      handleLogout();
                    }}
                  />
                ) : null}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

      <header className="pointer-events-none fixed left-0 right-0 top-0 z-50 px-3 pb-3 pt-3 sm:px-4 sm:pb-4 sm:pt-4 lg:px-6">
        <nav
          aria-label="Account"
          className="pointer-events-auto mx-auto flex min-h-[3.25rem] w-full max-w-app items-center gap-2 rounded-full border border-line/90 bg-white/95 px-3 py-2.5 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.15)] backdrop-blur-xl sm:gap-3 sm:px-5 sm:py-3"
        >
          <button
            type="button"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-foreground-muted transition hover:bg-surface-muted hover:text-foreground lg:hidden"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open account menu"
          >
            <Bars3Icon className="h-5 w-5" />
          </button>

          <Link to="/" className="group flex min-w-0 shrink-0 items-center gap-2.5 rounded-full py-1 pr-2 sm:gap-3 sm:pr-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 via-brand-400 to-amber-300 text-base font-black text-white shadow-md sm:h-10 sm:w-10">
              E
            </span>
            <span className="hidden truncate text-lg font-extrabold tracking-tight text-foreground sm:inline">
              Ecommerce
            </span>
          </Link>

          <div className="hidden min-w-0 flex-1 items-center justify-center gap-1 lg:flex">
            <AccountNavLink to="/account/order" active={onOrders} icon={ClipboardDocumentListIcon}>
              My orders
            </AccountNavLink>
            <AccountNavLink to={profilePath} active={onProfile} icon={UserCircleIcon}>
              My profile
            </AccountNavLink>
          </div>

          <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
            <Link
              to="/products"
              className="hidden items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold text-brand-600 transition hover:bg-brand-50 sm:inline-flex"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Shop
            </Link>
            <CartNavButton navOnLight active={location.pathname === "/cart"} />
            {user?._id ? (
              <UserAccountMenu user={user} navOnLight context="storefront" onLogout={handleLogout} />
            ) : (
              <Link
                to="/login"
                className="rounded-full bg-brand-500 px-3 py-2 text-sm font-semibold text-white hover:bg-brand-600"
              >
                Sign in
              </Link>
            )}
          </div>
        </nav>
      </header>
    </>
  );
}
