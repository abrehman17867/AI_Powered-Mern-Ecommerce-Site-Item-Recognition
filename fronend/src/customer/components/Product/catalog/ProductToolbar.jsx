import React, { useRef, useState } from "react";
import {
  MagnifyingGlassIcon,
  Squares2X2Icon,
  ListBulletIcon,
  FunnelIcon,
  ArrowsRightLeftIcon,
  HeartIcon,
} from "@heroicons/react/24/outline";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { SORT_OPTIONS } from "./constants";
import { classNames } from "../../../../utils/classNames";
import { highlightMatch } from "./highlightMatch";
import { ProductImageSearchButton } from "./ProductImageSearch";

export default function ProductToolbar({
  title,
  breadcrumb,
  productCount,
  rangeLabel,
  searchInput,
  onSearchChange,
  onSearchSubmit,
  suggestions,
  onPickSuggestion,
  sort,
  onSortChange,
  view,
  onViewChange,
  wishlistCount,
  compareCount,
  onOpenFilters,
  onOpenWishlist,
  onOpenCompare,
  onImageSearch,
  imageSearchBusy,
  imageSearchDisabled,
}) {
  const [sortOpen, setSortOpen] = useState(false);
  const [suggestOpen, setSuggestOpen] = useState(false);
  const searchRef = useRef(null);
  const currentSort = SORT_OPTIONS.find((o) => o.query === sort) || SORT_OPTIONS[2];

  return (
    <header className="space-y-4 border-b border-line bg-white pb-4">
      <nav aria-label="Breadcrumb" className="text-xs text-foreground-muted">
        <ol className="flex flex-wrap items-center gap-1">
          <li>
            <a href="/" className="hover:text-brand-600">
              Home
            </a>
          </li>
          {breadcrumb?.map((crumb, i) => (
            <li key={crumb.label} className="flex items-center gap-1">
              <span>/</span>
              {crumb.href ? (
                <a href={crumb.href} className="hover:text-brand-600">
                  {crumb.label}
                </a>
              ) : (
                <span className="font-medium text-foreground">{crumb.label}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="page-title">{title}</h1>
          <p className="mt-1 text-sm text-foreground-muted">
            {rangeLabel || `${productCount ?? 0} products`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="relative rounded-xl border border-line p-2.5 hover:bg-surface-muted lg:hidden"
            onClick={onOpenFilters}
            aria-label="Open filters"
          >
            <FunnelIcon className="h-5 w-5" />
          </button>
          <button
            type="button"
            className="relative rounded-xl border border-line p-2.5 hover:bg-surface-muted"
            onClick={onOpenWishlist}
            aria-label={`Wishlist, ${wishlistCount} items`}
          >
            <HeartIcon className="h-5 w-5" />
            {wishlistCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                {wishlistCount}
              </span>
            )}
          </button>
          <button
            type="button"
            className="relative rounded-xl border border-line p-2.5 hover:bg-surface-muted"
            onClick={onOpenCompare}
            aria-label={`Compare, ${compareCount} items`}
          >
            <ArrowsRightLeftIcon className="h-5 w-5" />
            {compareCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-500 text-[10px] font-bold text-white">
                {compareCount}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <form
          className="relative flex-1"
          onSubmit={(e) => {
            e.preventDefault();
            onSearchSubmit?.();
            setSuggestOpen(false);
          }}
          role="search"
        >
          <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-foreground-muted" />
          <input
            ref={searchRef}
            type="search"
            value={searchInput}
            onChange={(e) => {
              onSearchChange(e.target.value);
              setSuggestOpen(true);
            }}
            onFocus={() => setSuggestOpen(true)}
            onBlur={() => window.setTimeout(() => setSuggestOpen(false), 150)}
            placeholder="Search name, brand, category, SKU…"
            aria-label="Search products"
            className="w-full rounded-xl border border-line bg-white py-2.5 pl-10 pr-12 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
          <ProductImageSearchButton
            busy={imageSearchBusy}
            disabled={imageSearchDisabled}
            onSelectFile={onImageSearch}
          />
          {suggestOpen && suggestions?.length > 0 && (
            <ul
              className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-line bg-white py-1 shadow-lg"
              role="listbox"
            >
              {suggestions.map((item) => (
                <li key={item._id} role="option" aria-selected={false}>
                  <button
                    type="button"
                    className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-surface-muted"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      onPickSuggestion?.(item);
                      setSuggestOpen(false);
                    }}
                  >
                    <img
                      src={item.imageUrl}
                      alt=""
                      className="h-10 w-10 rounded-lg object-cover"
                    />
                    <div>
                      <p className="font-medium">
                        {highlightMatch(item.title, searchInput)}
                      </p>
                      <p className="text-xs text-foreground-muted">{item.brand}</p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </form>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <button
              type="button"
              className="inline-flex min-w-[10rem] items-center justify-between gap-2 rounded-xl border border-line bg-white px-3 py-2.5 text-sm font-medium shadow-sm hover:bg-surface-muted"
              onClick={() => setSortOpen((o) => !o)}
              aria-haspopup="listbox"
              aria-expanded={sortOpen}
            >
              {currentSort.label}
              <ChevronDownIcon className="h-5 w-5 text-foreground-muted" />
            </button>
            {sortOpen && (
              <ul
                className="absolute right-0 z-20 mt-1 w-56 rounded-xl border border-line bg-white py-1 shadow-lg"
                role="listbox"
              >
                {SORT_OPTIONS.map((opt) => (
                  <li key={opt.id} role="option" aria-selected={sort === opt.query}>
                    <button
                      type="button"
                      className={classNames(
                        "w-full px-3 py-2 text-left text-sm hover:bg-surface-muted",
                        sort === opt.query && "bg-brand-50 font-semibold text-brand-700"
                      )}
                      onClick={() => {
                        onSortChange(opt.query);
                        setSortOpen(false);
                      }}
                    >
                      {opt.label}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex rounded-xl border border-line p-0.5 shadow-sm" role="group" aria-label="View mode">
            <button
              type="button"
              aria-pressed={view === "grid"}
              onClick={() => onViewChange("grid")}
              className={classNames(
                "rounded-lg p-2",
                view === "grid" ? "bg-brand-500 text-white" : "text-foreground-muted hover:bg-surface-muted"
              )}
            >
              <Squares2X2Icon className="h-5 w-5" />
            </button>
            <button
              type="button"
              aria-pressed={view === "list"}
              onClick={() => onViewChange("list")}
              className={classNames(
                "rounded-lg p-2",
                view === "list" ? "bg-brand-500 text-white" : "text-foreground-muted hover:bg-surface-muted"
              )}
            >
              <ListBulletIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
