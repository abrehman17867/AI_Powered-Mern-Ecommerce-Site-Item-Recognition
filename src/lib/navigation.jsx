"use client";

/**
 * react-router-dom compatibility layer for the Next.js App Router.
 *
 * The ported CRA components were written against react-router-dom v6. Rather
 * than rewrite ~48 component files, this module re-implements the small slice
 * of that API they actually use on top of next/navigation, so the components
 * keep their original logic and only their import path changes.
 */

import NextLink from "next/link";
import { useCallback, useEffect, useMemo, useRef } from "react";
import {
  usePathname,
  useRouter,
  useSearchParams as useNextSearchParams,
  useParams as useNextParams,
} from "next/navigation";

// react-router carries arbitrary `state` across navigations in memory. Next has
// no equivalent, so we stash it in sessionStorage keyed by destination path.
const STATE_KEY = "__routerState";

function writeState(to, state) {
  if (typeof window === "undefined" || !state) return;
  try {
    const store = JSON.parse(sessionStorage.getItem(STATE_KEY) || "{}");
    store[String(to).split("?")[0]] = state;
    sessionStorage.setItem(STATE_KEY, JSON.stringify(store));
  } catch {
    /* sessionStorage unavailable (private mode) — state is simply dropped */
  }
}

function readState(pathname) {
  if (typeof window === "undefined") return undefined;
  try {
    const store = JSON.parse(sessionStorage.getItem(STATE_KEY) || "{}");
    return store[pathname];
  } catch {
    return undefined;
  }
}

/** react-router's useNavigate(): navigate(to, { replace, state }) */
export function useNavigate() {
  const router = useRouter();

  return useCallback(
    (to, options = {}) => {
      if (typeof to === "number") {
        // navigate(-1) style history traversal
        if (to < 0) router.back();
        else router.forward();
        return;
      }

      writeState(to, options.state);

      if (options.replace) {
        router.replace(to);
      } else {
        router.push(to);
      }
    },
    [router]
  );
}

/** react-router's useLocation(): { pathname, search, hash, state } */
export function useLocation() {
  const pathname = usePathname();
  const searchParams = useNextSearchParams();

  const search = useMemo(() => {
    const qs = searchParams?.toString();
    return qs ? `?${qs}` : "";
  }, [searchParams]);

  const state = useMemo(() => readState(pathname), [pathname]);

  return useMemo(
    () => ({ pathname: pathname || "/", search, hash: "", state, key: pathname }),
    [pathname, search, state]
  );
}

/** react-router's useSearchParams(): returns a [params, setParams] tuple. */
export function useSearchParams() {
  const searchParams = useNextSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const setSearchParams = useCallback(
    (next, options = {}) => {
      const params =
        typeof next === "function"
          ? next(new URLSearchParams(searchParams?.toString()))
          : new URLSearchParams(next);
      const qs = params.toString();
      const url = qs ? `${pathname}?${qs}` : pathname;
      if (options.replace) router.replace(url);
      else router.push(url);
    },
    [router, pathname, searchParams]
  );

  return [searchParams, setSearchParams];
}

export const useParams = useNextParams;

/** react-router's <Link to=...> mapped onto next/link. */
export function Link({ to, href, state, replace, children, ...rest }) {
  const target = to ?? href ?? "#";

  const handleClick = (event) => {
    if (state) writeState(target, state);
    rest.onClick?.(event);
  };

  return (
    <NextLink {...rest} href={target} replace={replace} onClick={handleClick}>
      {children}
    </NextLink>
  );
}

export const NavLink = Link;

/** react-router's <Navigate to=... replace state=... /> */
export function Navigate({ to, replace = false, state }) {
  const router = useRouter();
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    writeState(to, state);
    if (replace) router.replace(to);
    else router.push(to);
  }, [router, to, replace, state]);

  return null;
}
