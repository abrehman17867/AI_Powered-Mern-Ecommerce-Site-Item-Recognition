import React, { Fragment, useEffect, useMemo, useState } from "react";
import { Dialog, Popover, Tab, Transition } from "@headlessui/react";
import {
  Bars3Icon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ShoppingBagIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { Snackbar, Alert } from "@mui/material";
import { useLocation, useNavigate, Link } from "react-router-dom";
import AuthModal from "../../Auth/AuthModal";
import { useDispatch, useSelector } from "react-redux";
import { getUser, logout } from "../../../State/Auth/Action";
import { getCart } from "../../../State/Cart/Action";
import { getAllCategories } from "../../../State/Category/Action";
import { navigation } from "../../../data/NavigationData/navigationData";
import { buildNavigationFromCategories } from "../../../utils/buildNavigationFromCategories";
import ButtonPrimary from "../ui/ButtonPrimary";
import UserAccountMenu, {
  UserAccountMobileLinks,
} from "./UserAccountMenu";
import CartNavButton from "./CartNavButton";
import { useCartCount } from "../../../hooks/useCartCount";
import CartBadge from "./CartBadge";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

const navLinkBase =
  "relative inline-flex items-center gap-1.5 px-2 py-2 text-[14px] font-medium outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-orange-500/70 after:pointer-events-none after:absolute after:bottom-0 after:left-1/2 after:h-0.5 after:w-full after:-translate-x-1/2 after:origin-center after:scale-x-0 after:rounded-full after:bg-orange-500 after:transition-transform after:duration-300 after:ease-[cubic-bezier(0.33,1,0.68,1)] after:content-[''] hover:after:scale-x-100";

function navLinkClass(onLight) {
  return classNames(
    navLinkBase,
    onLight
      ? "text-zinc-600 hover:text-zinc-900 focus-visible:ring-offset-white"
      : "text-zinc-200 hover:text-white focus-visible:ring-offset-zinc-950"
  );
}

function navLinkActive(onLight) {
  return onLight ? "text-zinc-900 after:scale-x-100" : "text-white after:scale-x-100";
}

/** `/:a/:b/:c` product listing by category — not reserved app routes */
const RESERVED_PATH_ROOTS = new Set([
  "cart",
  "products",
  "product",
  "checkout",
  "contact-us",
  "login",
  "register",
  "account",
  "rate-review",
  "paymentsuccesspage",
  "paymentcancelpage",
]);

function isThreeSegmentCategoryRoute(pathname) {
  const segs = pathname.split("/").filter(Boolean);
  if (segs.length !== 3) return false;
  return !RESERVED_PATH_ROOTS.has(segs[0].toLowerCase());
}

function isNavPageHrefActive(pathname, href) {
  if (!href) return false;
  if (href === "/products") {
    return (
      pathname === "/products" ||
      pathname.startsWith("/products/") ||
      pathname.startsWith("/product/")
    );
  }
  if (href === "/contact-us") return pathname === "/contact-us" || pathname.startsWith("/contact-us/");
  return pathname === href || pathname.startsWith(`${href}/`);
}

const DEFAULT_PARENT_TILE_IMG =
  "https://images.pexels.com/photos/5632402/pexels-photo-5632402.jpeg?auto=compress&cs=tinysrgb&w=600";

/** Desktop mega: step 1 = parent departments; step 2 = same grid as storefront (featured + sections). */
function CategoriesDesktopMegaPanel({ categories, close, onCategoryLeafClick }) {
  const [step, setStep] = useState("parents");
  const [activeParent, setActiveParent] = useState(null);

  if (step === "parents") {
    return (
      <div className="relative bg-white">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-gray-100/80 to-transparent" aria-hidden />
        <div className="relative mx-auto max-h-[min(78vh,40rem)] max-w-7xl overflow-y-auto overscroll-contain">
          <div className="px-6 py-12 sm:px-8 sm:py-14 lg:px-10">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
              Shop by categories
            </p>
            <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
              {categories.map((cat) => {
                const tile = cat.featured?.[0];
                const img = tile?.imageSrc || DEFAULT_PARENT_TILE_IMG;
                const alt = tile?.imageAlt || cat.name;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setActiveParent(cat);
                      setStep("detail");
                    }}
                    className="group relative text-left text-sm sm:text-sm"
                  >
                    <div className="aspect-h-1 aspect-w-1 overflow-hidden rounded-xl bg-gray-100 shadow-inner ring-1 ring-gray-200/60 transition duration-200 group-hover:ring-2 group-hover:ring-orange-400/65 group-hover:shadow-md">
                      <img
                        src={img}
                        alt={alt}
                        className="object-cover object-center transition duration-300 group-hover:scale-105"
                      />
                    </div>
                    <span className="mt-4 block font-semibold text-gray-900 transition-colors group-hover:text-orange-700">
                      {cat.name}
                    </span>
                    <p aria-hidden className="mt-1 text-xs font-medium text-orange-600 transition group-hover:translate-x-0.5">
                      Shop {cat.name} →
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === "detail") {
    if (!activeParent) {
      return (
        <div className="relative bg-white px-8 py-12">
          <button
            type="button"
            onClick={() => setStep("parents")}
            className="inline-flex items-center gap-2 rounded-lg px-1 py-1 text-sm font-semibold text-orange-600 transition-all duration-200 hover:bg-orange-50 hover:text-orange-900 active:scale-[0.98]"
          >
            <ChevronLeftIcon className="h-4 w-4" aria-hidden />
            All categories
          </button>
        </div>
      );
    }

    const category = activeParent;

    return (
      <div className="relative bg-white">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-gray-100/80 to-transparent"
          aria-hidden
        />
        <div className="relative border-b border-gray-100 bg-white/95 px-6 py-3 sm:px-8 lg:px-10">
        <button
          type="button"
          onClick={() => {
            setStep("parents");
            setActiveParent(null);
          }}
          className="inline-flex items-center gap-2 rounded-lg px-1 py-1 text-sm font-semibold text-gray-700 transition-all duration-200 hover:bg-orange-50 hover:text-orange-900 active:scale-[0.98]"
        >
            <ChevronLeftIcon className="h-4 w-4" aria-hidden />
            All categories
          </button>
          <span className="ml-3 text-sm font-semibold text-gray-400">/</span>
          <span className="ml-3 text-sm font-semibold text-gray-900">{category.name}</span>
        </div>
        <div className="relative mx-auto max-h-[min(78vh,40rem)] max-w-7xl overflow-y-auto overscroll-contain">
          <div className="px-6 py-10 sm:px-8 sm:py-12 lg:px-10">
            <div className="grid grid-cols-1 gap-x-10 gap-y-12 lg:grid-cols-2">
              <div className="col-start-1 row-start-1 grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:col-start-2 lg:row-start-1">
                {category.featured.map((item) => (
                <Link
                  key={item.name}
                  to={item.href || "/products"}
                  onClick={close}
                  className="group relative text-sm sm:text-sm"
                >
                  <div className="aspect-h-1 aspect-w-1 overflow-hidden rounded-xl bg-gray-100 shadow-inner ring-1 ring-gray-200/60 transition duration-200 group-hover:ring-2 group-hover:ring-orange-400/60 group-hover:shadow-md">
                    <img
                      src={item.imageSrc}
                      alt={item.imageAlt}
                      className="object-cover object-center transition duration-300 group-hover:scale-105"
                    />
                  </div>
                  <span className="mt-4 block font-semibold text-gray-900 transition-colors group-hover:text-orange-700">
                    {item.name}
                  </span>
                  <p aria-hidden className="mt-1 text-xs font-medium text-orange-600 transition group-hover:translate-x-0.5">
                    Shop now →
                  </p>
                  </Link>
                ))}
              </div>
              <div className="row-start-1 grid grid-cols-2 gap-x-8 gap-y-10 text-sm sm:grid-cols-3 lg:col-span-1 lg:row-start-1">
                {category.sections.map((section) => (
                  <div key={`${category.id}-${section.id}`} className="min-w-0">
                    <p
                      id={`${category.id}-${section.id}-heading`}
                      className="border-b border-gray-100 pb-2 text-sm font-semibold uppercase tracking-wide text-gray-900"
                    >
                      {section.name}
                    </p>
                    <ul
                      aria-labelledby={`${category.id}-${section.id}-heading`}
                      className="mt-4 space-y-3.5"
                    >
                      {section.items.map((item) => (
                        <li key={`${section.id}-${item.id}`} className="flex">
                        <button
                          type="button"
                          onClick={() => onCategoryLeafClick(category, section, item, close)}
                          className="-mx-1 rounded-md px-1 py-0.5 text-left text-[13px] font-medium text-gray-600 transition-all duration-200 hover:bg-orange-50/90 hover:text-orange-800"
                        >
                            {item.name}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

function authRedirectToastMessage(from) {
  if (!from || typeof from !== "string") {
    return "Please sign in to continue.";
  }
  if (from === "/checkout" || from.startsWith("/checkout")) {
    return "Sign in to continue to checkout.";
  }
  if (from.startsWith("/account/order")) {
    return "Sign in to view your orders.";
  }
  if (from.startsWith("/account/profile")) {
    return "Sign in to view your profile.";
  }
  if (from.startsWith("/account")) {
    return "Sign in to access your account.";
  }
  return `Sign in to continue (${from}).`;
}

export default function Navigation() {
  const [openAuthModal, setOpenAuthModal] = useState(false);
  const [open, setOpen] = useState(false);
  const [authToastOpen, setAuthToastOpen] = useState(false);
  const [authToastMessage, setAuthToastMessage] = useState("");

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const jwt = localStorage.getItem("jwt");
  const { auth } = useSelector((store) => store);
  const { categories: categoryList, loading: categoriesLoading } = useSelector(
    (store) => store.categories
  );
  const location = useLocation();

  const navData = useMemo(() => {
    const pages = navigation.pages;
    const built = buildNavigationFromCategories(categoryList);
    if (built?.categories?.length) {
      return { categories: built.categories, pages };
    }
    // After fetch: empty API → classic demo tree so mega menus match the original storefront
    if (!categoriesLoading && Array.isArray(categoryList) && categoryList.length === 0) {
      return {
        categories: navigation.categories || [],
        pages,
      };
    }
    return { categories: [], pages };
  }, [categoryList, categoriesLoading]);

  const pathname = location.pathname;
  const categoriesRouteActive = isThreeSegmentCategoryRoute(pathname);
  const homeRouteActive = pathname === "/";
  const cartRouteActive = pathname === "/cart" || pathname.startsWith("/cart/");

  const cartItemCount = useCartCount();

  const mobileCategoryTabFromRoute = useMemo(() => {
    if (!categoriesRouteActive || !navData.categories?.length) return 0;
    const level1 = pathname.split("/").filter(Boolean)[0];
    const i = navData.categories.findIndex((c) => String(c.id) === String(level1));
    return i >= 0 ? i : 0;
  }, [categoriesRouteActive, pathname, navData.categories]);

  const [mobileCatTab, setMobileCatTab] = useState(0);
  const [navPastHero, setNavPastHero] = useState(false);

  /** Light navbar (dark text) on white pages / below home hero */
  const navOnLight = !homeRouteActive || navPastHero;

  useEffect(() => {
    setMobileCatTab(mobileCategoryTabFromRoute);
  }, [mobileCategoryTabFromRoute]);

  useEffect(() => {
    const onScroll = () => {
      const threshold = Math.min(window.innerHeight * 0.62, 520);
      setNavPastHero(window.scrollY > threshold);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [homeRouteActive]);

  useEffect(() => {
    if (!homeRouteActive) setNavPastHero(false);
  }, [homeRouteActive]);

  const handleOpen = () => {
    navigate("/login");
  };

  const handleClose = () => {
    setOpenAuthModal(false);
  };

  const handleCategoryClick = (category, section, item, close) => {
    if (item?.browseProducts) {
      navigate("/products");
      close();
      return;
    }
    navigate(`/${category.id}/${section.id}/${item.id}`);
    close();
  };

  useEffect(() => {
    dispatch(getAllCategories());
  }, [dispatch]);

  useEffect(() => {
    if (!location.state?.showAuth) return;
    const from = location.state?.from;
    if (from) {
      setAuthToastMessage(authRedirectToastMessage(from));
      setAuthToastOpen(true);
    }
    navigate("/login", { replace: true, state: from ? { from } : {} });
  }, [location.state, navigate]);

  useEffect(() => {
    if (jwt) {
      dispatch(getUser(jwt, { silent: true }));
    }
  }, [jwt, dispatch]);

  useEffect(() => {
    if (!jwt) return;
    dispatch(getCart({ silent: true }));
  }, [jwt, pathname, dispatch]);

  useEffect(() => {
    if (auth.user) {
      handleClose();
    }
  }, [auth.user]);

  useEffect(() => {
    if (
      !auth.user ||
      (location.pathname !== "/login" && location.pathname !== "/register")
    ) {
      return;
    }
    navigate("/", { replace: true });
  }, [auth.user, location.pathname, navigate]);

  const handleLogout = () => {
    dispatch(logout());
    localStorage.clear();
    navigate("/", { replace: true });
  };

  return (
    
    <div className="relative">
      {/* Mobile menu — above fixed navbar */}
      <Transition.Root show={open} as={Fragment}>
        <Dialog as="div" className="relative z-[60] lg:hidden" onClose={setOpen}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 z-[60] bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 z-[60] flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative flex w-full max-w-xs flex-col overflow-y-auto border-r border-slate-200/80 bg-gradient-to-b from-slate-50 via-white to-white pb-12 shadow-2xl shadow-slate-900/15">
                <div className="flex px-4 pb-2 pt-5">
                  <button
                    type="button"
                    className="relative -m-2 inline-flex items-center justify-center rounded-full p-2 text-zinc-500 transition-colors hover:bg-orange-50 hover:text-orange-600"
                    onClick={() => setOpen(false)}
                  >
                    <span className="absolute -inset-0.5" />
                    <span className="sr-only">Close menu</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>

                {/* Category tree: L1 tabs → L2 headings → L3 links (API) */}
                {navData.categories.length > 0 ? (
                <Tab.Group
                  selectedIndex={mobileCatTab}
                  onChange={setMobileCatTab}
                  as="div"
                  className="mt-2"
                >
                  <p className="px-4 pt-1 text-[11px] font-bold uppercase tracking-[0.2em] text-gray-500">
                    Categories
                  </p>
                  <div className="flex flex-wrap gap-x-4 gap-y-2 border-b border-gray-100 px-4 pb-3 pt-2">
                    {navData.pages.map((page) => {
                      const pageActive = isNavPageHrefActive(pathname, page.href);
                      return (
                      <Link
                        key={page.name}
                        to={page.href}
                        onClick={() => setOpen(false)}
                        aria-current={pageActive ? "page" : undefined}
                        className={classNames(
                          "rounded-md px-2 py-1.5 text-sm font-medium transition-colors duration-200 ease-out",
                          pageActive
                            ? "bg-orange-50 font-semibold text-orange-950 shadow-sm"
                            : "text-gray-700 hover:bg-slate-100 hover:text-gray-900"
                        )}
                      >
                        {page.name}
                      </Link>
                      );
                    })}
                  </div>
                  <div className="border-b border-gray-200">
                    <Tab.List className="-mb-px flex gap-x-4 overflow-x-auto px-4 pb-px sm:gap-x-6">
                      {navData.categories.map((category) => (
                        <Tab
                          key={category.id}
                          className={({ selected }) =>
                            classNames(
                              selected
                                ? "border-orange-500 text-orange-700"
                                : "border-transparent text-gray-700 hover:bg-slate-50 hover:text-gray-900",
                              "shrink-0 whitespace-nowrap rounded-t-md border-b-2 px-2 py-4 text-base font-medium transition-colors duration-200 ease-out"
                            )
                          }
                        >
                          {category.name}
                        </Tab>
                      ))}
                    </Tab.List>
                  </div>
                  <Tab.Panels as={Fragment}>
                    {navData.categories.map((category) => (
                      <Tab.Panel
                        key={category.id}
                        className="space-y-10 px-4 pb-8 pt-10"
                      >
                        <div className="grid grid-cols-2 gap-x-4">
                          {category.featured.map((item) => (
                            <Link
                              key={item.name}
                              to={item.href || "/products"}
                              onClick={() => setOpen(false)}
                              className="group relative text-sm"
                            >
                              <div className="aspect-h-1 aspect-w-1 overflow-hidden rounded-lg bg-gray-100 group-hover:opacity-75">
                                <img
                                  src={item.imageSrc}
                                  alt={item.imageAlt}
                                  className="object-cover object-center"
                                />
                              </div>
                              <span className="mt-6 block font-medium text-gray-900">
                                {item.name}
                              </span>
                              <p aria-hidden="true" className="mt-1">
                                Shop now
                              </p>
                            </Link>
                          ))}
                        </div>
                        {category.sections.map((section) => (
                          <div key={`${category.id}-${section.id}`}>
                            <p
                              id={`${category.id}-${section.id}-heading-mobile`}
                              className="font-medium text-gray-900"
                            >
                              {section.name}
                            </p>
                            <ul
                              aria-labelledby={`${category.id}-${section.id}-heading-mobile`}
                              className="mt-6 flex flex-col space-y-6"
                            >
                              {section.items.map((item) => (
                                <li key={`${section.id}-${item.id}`} className="flow-root">
                                  <button
                                    type="button"
                                    className="-m-2 block w-full p-2 text-left text-gray-500 hover:text-gray-800"
                                    onClick={() =>
                                      handleCategoryClick(
                                        category,
                                        section,
                                        item,
                                        () => setOpen(false)
                                      )
                                    }
                                  >
                                    {item.name}
                                  </button>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </Tab.Panel>
                    ))}
                  </Tab.Panels>
                </Tab.Group>
                ) : (
                  <div className="mt-4 px-4 pb-6">
                    <p className="text-sm text-gray-500">
                      {categoriesLoading
                        ? "Loading categories…"
                        : "Categories will appear here when your catalog has level 1–3 groups. Open Products to browse everything."}
                    </p>
                    <Link
                      to="/products"
                      onClick={() => setOpen(false)}
                      className="mt-4 inline-block text-sm font-medium text-orange-600"
                    >
                      Browse all products
                    </Link>
                    <div className="mt-6 flex flex-col gap-3 border-t border-gray-200 pt-5">
                      {navData.pages.map((page) => {
                        const pageActive = isNavPageHrefActive(pathname, page.href);
                        return (
                        <Link
                          key={page.name}
                          to={page.href}
                          onClick={() => setOpen(false)}
                          aria-current={pageActive ? "page" : undefined}
                          className={classNames(
                            "rounded-md py-1.5 text-sm font-semibold transition-colors duration-200",
                            pageActive
                              ? "text-orange-900"
                              : "text-gray-900 hover:text-orange-700"
                          )}
                        >
                          {page.name}
                        </Link>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="border-t border-gray-200 px-4 py-4">
                  <button
                    type="button"
                    className="relative flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-gray-900 transition-colors hover:bg-orange-50 hover:text-orange-700"
                    onClick={() => {
                      setOpen(false);
                      navigate("/cart");
                    }}
                  >
                    <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-zinc-100">
                      <ShoppingBagIcon className="h-5 w-5 text-zinc-700" aria-hidden />
                      <CartBadge count={cartItemCount} surface="light" className="-right-0.5 -top-0.5" />
                    </span>
                    <span>
                      Cart
                      {cartItemCount > 0 ? (
                        <span className="ml-1.5 text-xs font-normal text-zinc-500">
                          ({cartItemCount} item{cartItemCount === 1 ? "" : "s"})
                        </span>
                      ) : null}
                    </span>
                  </button>
                </div>

                {auth.user?._id ? (
                  <UserAccountMobileLinks
                    user={auth.user}
                    onNavigate={(path) => {
                      setOpen(false);
                      navigate(path);
                    }}
                    onLogout={() => {
                      setOpen(false);
                      handleLogout();
                    }}
                  />
                ) : (
                  <div className="space-y-6 border-t border-gray-200 px-4 py-6">
                    <div className="flow-root">
                      <button
                        type="button"
                        className="-m-2 block w-full rounded-lg p-2 text-left text-sm font-semibold text-gray-900 transition-colors hover:bg-orange-50 hover:text-orange-700"
                        onClick={() => {
                          setOpen(false);
                          handleOpen();
                        }}
                      >
                        Sign in
                      </button>
                    </div>
                    <div className="flow-root">
                      <button
                        type="button"
                        className="-m-2 block w-full rounded-lg p-2 text-left text-sm font-semibold text-gray-900 transition-colors hover:bg-orange-50 hover:text-orange-700"
                        onClick={() => {
                          setOpen(false);
                          navigate("/register");
                        }}
                      >
                        Create account
                      </button>
                    </div>
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

      <header className="pointer-events-none fixed left-0 right-0 top-0 z-50 px-3 pb-3 pt-3 sm:px-4 sm:pb-4 sm:pt-4 md:px-4 lg:px-6">
        <nav
          aria-label="Top"
          className={classNames(
            "pointer-events-auto mx-auto flex min-h-[3.25rem] w-full max-w-[min(1200px,calc(100vw-1.5rem))] items-center gap-2 rounded-full px-3 py-2.5 sm:gap-3 sm:px-5 sm:py-3 md:max-w-[min(1200px,calc(100vw-2rem))]",
            "transition-[box-shadow,background-color,border-color,color] duration-300",
            navOnLight
              ? "border border-zinc-200/90 bg-white/95 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.2)] backdrop-blur-xl"
              : "border border-white/15 bg-zinc-950/45 shadow-none backdrop-blur-md"
          )}
        >
          <button
            type="button"
            className={classNames(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors lg:hidden",
              navOnLight
                ? "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                : "text-zinc-400 hover:bg-white/10 hover:text-white"
            )}
            onClick={() => setOpen(true)}
          >
            <span className="sr-only">Open menu</span>
            <Bars3Icon className="h-5 w-5" aria-hidden="true" />
          </button>

          {/* Logo — E mark (orange) + white wordmark like reference */}
          <div className="flex min-w-0 shrink-0 items-center lg:pl-1">
            <Link
              to="/"
              aria-current={homeRouteActive ? "page" : undefined}
              className={classNames(
                "group flex min-w-0 items-center gap-2.5 rounded-full py-1 pl-0.5 pr-2 outline-none transition-colors duration-200 sm:gap-3 sm:pr-3",
                navOnLight
                  ? "hover:bg-zinc-100 focus-visible:ring-offset-white"
                  : "hover:bg-white/10 focus-visible:ring-offset-transparent",
                homeRouteActive && !navOnLight && "ring-1 ring-white/10"
              )}
            >
              <span className="sr-only">Ecommerce home</span>
              <span
                aria-hidden
                className={classNames(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 via-orange-400 to-amber-300 text-base font-black tracking-tight text-white shadow-lg shadow-orange-950/40 ring-2 ring-orange-400/30 ring-offset-2 transition duration-200 group-hover:shadow-orange-500/35 sm:h-10 sm:w-10 sm:text-lg",
                  navOnLight ? "ring-offset-white" : "ring-offset-zinc-950"
                )}
              >
                E
              </span>
              <span
                className={classNames(
                  "truncate text-lg font-extrabold tracking-tight sm:text-xl",
                  navOnLight ? "text-zinc-900" : "text-white"
                )}
              >
                Ecommerce
              </span>
            </Link>
          </div>

          <div className="relative z-20 hidden min-w-0 flex-1 items-center justify-center gap-x-2 lg:flex xl:gap-x-3">
            {navData.categories.length > 0 ? (
              <Popover className="relative">
                {({ open: catOpen, close }) => (
                  <>
                    <Popover.Button
                      aria-current={categoriesRouteActive ? "page" : undefined}
                      className={classNames(
                        navLinkClass(navOnLight),
                        (catOpen || categoriesRouteActive) && navLinkActive(navOnLight)
                      )}
                    >
                      Categories
                      <ChevronDownIcon
                        className={classNames(
                          "h-4 w-4 transition-transform duration-200",
                          navOnLight ? "text-zinc-400" : "text-zinc-500",
                          catOpen && "rotate-180",
                          (catOpen || categoriesRouteActive) &&
                            (navOnLight ? "text-orange-600" : "text-orange-300")
                        )}
                        aria-hidden="true"
                      />
                    </Popover.Button>

                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-200"
                      enterFrom="opacity-0"
                      enterTo="opacity-100"
                      leave="transition ease-in duration-150"
                      leaveFrom="opacity-100"
                      leaveTo="opacity-0"
                    >
                      <Popover.Panel className="fixed left-2 right-2 top-[5.75rem] z-[70] max-h-[min(calc(100vh-6.5rem),42rem)] overflow-y-auto overflow-x-hidden overscroll-contain rounded-2xl border border-zinc-200 bg-white text-sm text-slate-600 shadow-2xl shadow-black/25 sm:left-4 sm:right-4 sm:top-[6.25rem] lg:left-8 lg:right-8">
                        <CategoriesDesktopMegaPanel
                          categories={navData.categories}
                          close={close}
                          onCategoryLeafClick={handleCategoryClick}
                        />
                      </Popover.Panel>
                    </Transition>
                  </>
                )}
              </Popover>
            ) : null}

            {navData.pages.map((page) => {
              const pageActive = isNavPageHrefActive(pathname, page.href);
              return (
                <Link
                  key={page.name}
                  to={page.href}
                  aria-current={pageActive ? "page" : undefined}
                  className={classNames(
                    navLinkClass(navOnLight),
                    pageActive && navLinkActive(navOnLight)
                  )}
                >
                  {page.name}
                </Link>
              );
            })}
          </div>

          <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-2.5">
            <div className="hidden items-center gap-2 lg:flex">
              {auth.user?.firstName ? (
                <UserAccountMenu
                  user={auth.user}
                  navOnLight={navOnLight}
                  onLogout={handleLogout}
                />
              ) : (
                <ButtonPrimary type="button" onClick={handleOpen}>
                  Sign in
                </ButtonPrimary>
              )}
            </div>

            <CartNavButton navOnLight={navOnLight} active={cartRouteActive} />
          </div>
        </nav>
      </header>

      {!homeRouteActive ? (
        <div className="h-[5.75rem] shrink-0 sm:h-[6.25rem]" aria-hidden="true" />
      ) : null}

      <Snackbar
        open={authToastOpen}
        autoHideDuration={7000}
        onClose={() => setAuthToastOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setAuthToastOpen(false)}
          severity="info"
          variant="filled"
          sx={{ width: "100%", maxWidth: 480 }}
        >
          {authToastMessage}
        </Alert>
      </Snackbar>

      <AuthModal handleClose={handleClose} open={openAuthModal} />
    </div>
  );
}
