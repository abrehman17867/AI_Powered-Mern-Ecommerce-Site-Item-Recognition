"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate, useParams } from "@/lib/navigation";
import { toast } from "react-toastify";
import { findAllProducts, findProducts } from "../../../../State/Product/Action";
import { getAllCategories } from "../../../../State/Category/Action";
import { addItemToCart } from "../../../../State/Cart/Action";
import { api } from "../../../../config/apiConfig";
import {
  buildApiParams,
  buildCatalogSearch,
  getActiveChips,
  parseCatalogSearch,
} from "./catalogUrl";
import {
  buildCategoryPathLabels,
  categoryPathTitle,
  leafCategoryName,
} from "./catalogCategoryPath";
import { PAGE_SIZE, VIEW_GRID } from "./constants";
import { useDebouncedValue } from "./useDebouncedValue";
import { useWishlist } from "./useWishlist";
import { useCompare } from "./useCompare";
import ProductToolbar from "./ProductToolbar";
import ProductFilters from "./ProductFilters";
import ActiveFilterChips from "./ActiveFilterChips";
import ProductGrid from "./ProductGrid";
import ProductPagination from "./ProductPagination";
import ProductQuickView from "./ProductQuickView";
import ProductCompareDrawer from "./ProductCompareDrawer";
import ProductWishlistDrawer from "./ProductWishlistDrawer";
import { ProductImageSearchStatus } from "./ProductImageSearch";
import InlineLoadingBar from "../../../../components/ui/InlineLoadingBar";
import { searchProductsByImage } from "../apiService";

const VIEW_KEY = "ecom_catalog_view";

function formatImageSearchError(err) {
  const raw =
    err?.response?.data?.error ||
    err?.response?.data?.message ||
    err?.message ||
    "";
  const line = String(raw)
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .pop();
  if (!line) {
    return "Image search failed. Restart the backend after running npm install in the backend folder.";
  }
  if (line.includes("ModuleNotFoundError") || line.includes("No module named")) {
    return "Python ML packages missing. In the backend folder run: pip install -r requirements.txt — or restart the API (Node fallback will run automatically).";
  }
  return line.replace(/^Error searching products by image:\s*/i, "");
}

function filtersToDraft(parsed) {
  const [min, max] = parsed.price ? parsed.price.split("-") : ["", ""];
  return {
    ...parsed,
    minPriceCustom: min,
    maxPriceCustom: max,
  };
}

export default function ProductsCatalog({ mode = "category" }) {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();
  const dispatch = useDispatch();
  const { products } = useSelector((store) => store);
  const categoryState = useSelector((store) => store.categories);

  const filters = useMemo(
    () => parseCatalogSearch(location.search),
    [location.search]
  );

  const [searchInput, setSearchInput] = useState(filters.q);
  const debouncedSearch = useDebouncedValue(searchInput, 400);
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [imageSearch, setImageSearch] = useState({
    busy: false,
    label: null,
    error: null,
    results: [],
    previewUrl: null,
    matchMethod: null,
  });

  // Catalog-wide facet values. Derived from the whole collection, not the
  // page currently on screen, so the brand and colour lists stay stable while
  // paging and reflect everything the store actually sells.
  const [facets, setFacets] = useState({ brands: [], colors: [], sizes: [] });

  const [draft, setDraft] = useState(() => filtersToDraft(filters));
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [compareOpen, setCompareOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  const wishlist = useWishlist();
  const compare = useCompare();

  const [view, setView] = useState(() => {
    try {
      return localStorage.getItem(VIEW_KEY) || VIEW_GRID;
    } catch {
      return VIEW_GRID;
    }
  });

  useEffect(() => {
    localStorage.setItem(VIEW_KEY, view);
  }, [view]);

  useEffect(() => {
    setSearchInput(filters.q);
    setDraft(filtersToDraft(filters));
  }, [filters]);

  useEffect(() => {
    dispatch(getAllCategories());
  }, [dispatch]);

  useEffect(() => {
    let cancelled = false;
    api
      .get("/api/products/facets")
      .then(({ data }) => {
        if (!cancelled) {
          setFacets({
            brands: data?.brands || [],
            colors: data?.colors || [],
            sizes: data?.sizes || [],
          });
        }
      })
      .catch(() => {
        /* sidebar falls back to whatever the current page yields */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const categorySlug = params.lavelThree;

  const clearImageSearch = useCallback(() => {
    setImageSearch((prev) => {
      if (prev.previewUrl) URL.revokeObjectURL(prev.previewUrl);
      return {
        busy: false,
        label: null,
        error: null,
        results: [],
        previewUrl: null,
        matchMethod: null,
      };
    });
  }, []);

  useEffect(() => {
    clearImageSearch();
  }, [categorySlug, mode, location.pathname, clearImageSearch]);

  const runImageSearch = useCallback(
    async (file) => {
      if (!file) return;
      setSearchInput("");
      setSearchResults([]);
      navigate(
        { pathname: location.pathname, search: buildCatalogSearch({ q: null }, location.search) },
        { replace: true }
      );
      const previewUrl = URL.createObjectURL(file);
      setImageSearch({
        busy: true,
        label: null,
        error: null,
        results: [],
        previewUrl,
        matchMethod: null,
      });
      try {
        const {
          products: imgProducts,
          predictedLabel,
          matchMethod,
        } = await searchProductsByImage(file);
        setImageSearch({
          busy: false,
          label: predictedLabel ?? null,
          error: null,
          results: Array.isArray(imgProducts) ? imgProducts : [],
          previewUrl,
          matchMethod: matchMethod ?? null,
        });
      } catch (err) {
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setImageSearch({
          busy: false,
          label: null,
          error: formatImageSearchError(err),
          results: [],
          previewUrl: null,
          matchMethod: null,
        });
      }
    },
    [navigate, location.pathname, location.search]
  );

  useEffect(() => {
    if (debouncedSearch.trim() && mode === "all") {
      clearImageSearch();
      const next = buildCatalogSearch({ q: debouncedSearch.trim(), page: 1 }, location.search);
      if (next !== location.search) {
        navigate({ pathname: location.pathname, search: next }, { replace: true });
      }
    } else if (!debouncedSearch.trim() && filters.q) {
      navigate(
        { pathname: location.pathname, search: buildCatalogSearch({ q: null }, location.search) },
        { replace: true }
      );
    }
  }, [debouncedSearch, mode, navigate, location.pathname, location.search, filters.q, clearImageSearch]);

  useEffect(() => {
    const q = filters.q?.trim();
    if (!q || mode !== "all") {
      setSearchResults([]);
      return;
    }
    let cancelled = false;
    setSearchLoading(true);
    api
      .get(`/api/products/search?query=${encodeURIComponent(q)}`)
      .then(({ data }) => {
        if (!cancelled) setSearchResults(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!cancelled) setSearchResults([]);
      })
      .finally(() => {
        if (!cancelled) setSearchLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [filters.q, mode]);

  useEffect(() => {
    if (filters.q?.trim() && mode === "all") return;
    if (imageSearch.results.length > 0 || imageSearch.busy) return;

    const apiParams = buildApiParams(filters, mode, categorySlug);

    if (mode === "all") {
      dispatch(findAllProducts(apiParams));
    } else {
      dispatch(findProducts(apiParams));
    }
  }, [
    dispatch,
    mode,
    categorySlug,
    filters,
    imageSearch.results.length,
    imageSearch.busy,
  ]);

  const catalogData = products?.products;
  const hasTextSearch = Boolean(filters.q?.trim() && mode === "all");
  const hasImageSearch =
    imageSearch.busy || imageSearch.results.length > 0 || Boolean(imageSearch.label);
  const listProducts = useMemo(() => {
    if (hasTextSearch) return searchResults;
    if (hasImageSearch) return imageSearch.results;
    return catalogData?.content || [];
  }, [hasTextSearch, hasImageSearch, searchResults, imageSearch.results, catalogData?.content]);
  const totalProducts = catalogData?.totalProducts ?? listProducts.length;
  const totalPages = catalogData?.totalPages || 1;
  const currentPage = Number(catalogData?.curentPage || filters.page || 1);
  const pageSize = catalogData?.pageSize || PAGE_SIZE;

  const showBlockingSpinner =
    (products?.loading && !(catalogData?.content?.length > 0) && !hasTextSearch && !hasImageSearch) ||
    (imageSearch.busy && !imageSearch.results.length);
  // `refreshing` is the store's "results are stale but still worth showing"
  // flag. The old check read `loading`, which the silent-refetch path
  // deliberately leaves false — so paging and filtering used to refetch with
  // no indication at all that anything was happening.
  const isRefetching =
    !showBlockingSpinner &&
    ((products?.refreshing && !hasImageSearch && !hasTextSearch) ||
      (searchLoading && listProducts.length > 0));

  const brandList = useMemo(() => {
    if (facets.brands.length) return facets.brands;
    // Facets not loaded yet (or the request failed) — fall back to the brands
    // present in the current result set so the section is never empty.
    const fromList = (listProducts || []).map((p) => p.brand);
    return [...new Set(fromList.filter(Boolean))];
  }, [facets.brands, listProducts]);

  const topCategories = useMemo(() => {
    const list = categoryState?.categories || [];
    return list.filter((c) => c.level === 1 || !c.parentCategory).slice(0, 8);
  }, [categoryState]);

  const categoryPath = useMemo(() => {
    if (mode !== "category") return [];
    return buildCategoryPathLabels(params, categoryState?.categories || []);
  }, [mode, params, categoryState?.categories]);

  const leafCategoryLabel = useMemo(
    () => leafCategoryName(categoryPath),
    [categoryPath]
  );

  const chips = useMemo(
    () => getActiveChips(filters, topCategories.map((c) => ({ id: c._id, name: c.name }))),
    [filters, topCategories]
  );

  const rangeLabel = useMemo(() => {
    if (imageSearch.busy) return "Running visual search…";
    if (hasImageSearch && !hasTextSearch) {
      const labelPart = imageSearch.label ? ` for “${imageSearch.label}”` : "";
      return `${listProducts.length} visual match${listProducts.length === 1 ? "" : "es"}${labelPart}`;
    }
    if (filters.q) return `${listProducts.length} results for your search`;
    const start = (currentPage - 1) * pageSize + 1;
    const end = Math.min(currentPage * pageSize, totalProducts || listProducts.length);
    const total = totalProducts || listProducts.length;
    if (!total) return "No products";
    return `Showing ${start}–${end} of ${total} products`;
  }, [
    currentPage,
    pageSize,
    totalProducts,
    listProducts.length,
    filters.q,
    imageSearch.busy,
    imageSearch.label,
    hasImageSearch,
    hasTextSearch,
  ]);

  const suggestions = useMemo(() => {
    const q = searchInput.trim().toLowerCase();
    if (q.length < 2) return [];
    const pool = filters.q ? searchResults : catalogData?.content || [];
    return pool
      .filter(
        (p) =>
          p.title?.toLowerCase().includes(q) ||
          p.brand?.toLowerCase().includes(q) ||
          String(p._id).toLowerCase().includes(q)
      )
      .slice(0, 6);
  }, [searchInput, catalogData?.content, searchResults, filters.q]);

  const updateUrl = useCallback(
    (updates, replace = false) => {
      const search = buildCatalogSearch(updates, location.search);
      navigate({ pathname: location.pathname, search }, { replace });
    },
    [navigate, location.pathname, location.search]
  );

  const handleApplyFilters = () => {
    let price = draft.price;
    if (draft.minPriceCustom && draft.maxPriceCustom) {
      price = `${draft.minPriceCustom}-${draft.maxPriceCustom}`;
    }
    updateUrl({
      color: draft.color,
      size: draft.size,
      brand: draft.brand,
      price: price || null,
      discount: draft.discount || null,
      stock: draft.stock || null,
      category: draft.category || null,
      page: 1,
    });
    setMobileFiltersOpen(false);
  };

  const handleClearFilters = () => {
    const keep = mode === "all" && filters.q ? { q: filters.q } : {};
    if (!keep.q) clearImageSearch();
    navigate({ pathname: location.pathname, search: buildCatalogSearch(keep, "") });
    setDraft(filtersToDraft(parseCatalogSearch("")));
    setMobileFiltersOpen(false);
  };

  const handleRemoveChip = (chip) => {
    if (chip.type === "q") {
      setSearchInput("");
      updateUrl({ q: null, page: 1 });
      return;
    }
    const key = chip.type === "category" ? "category" : chip.type;
    const current = filters[key];
    if (Array.isArray(current)) {
      updateUrl({
        [key]: current.filter((v) => v !== chip.value),
        page: 1,
      });
    } else {
      updateUrl({ [key]: null, page: 1 });
    }
  };

  const handleWishlist = (product) => {
    const wasIn = wishlist.has(product._id);
    wishlist.toggle(product);
    toast.info(wasIn ? "Removed from wishlist" : "Added to wishlist", {
      autoClose: 1500,
    });
  };

  const handleCompare = (product) => {
    if (!compare.has(product._id) && compare.count >= compare.max) {
      toast.warning(`Compare up to ${compare.max} products`);
      return;
    }
    compare.toggle(product);
  };

  const addingItem = useSelector((store) => store.cart.addingItem);
  const addingProductId = useSelector((store) => store.cart.addingProductId);

  const handleAddToCart = async (product, opts = {}) => {
    if (addingItem) return false;
    if (!localStorage.getItem("jwt")) {
      toast.error("Please sign in to add items to your cart.");
      navigate("/login", { state: { from: location.pathname + location.search } });
      return false;
    }
    const availableSizes =
      product.sizes?.filter((s) => Number(s.quantity) > 0) || [];
    const size = opts.size || availableSizes[0]?.name;
    if (availableSizes.length > 0 && !size) {
      toast.error("Please select a size.");
      setQuickViewProduct(product);
      return false;
    }
    try {
      await dispatch(
        addItemToCart({
          productId: product._id,
          size: size || "ONE",
          quantity: Math.max(1, Number(opts.qty) || 1),
        })
      );
      toast.success("Added to cart");
      setQuickViewProduct(null);
      return true;
    } catch (e) {
      const msg = e?.message || "Could not add to cart";
      toast.error(msg);
      throw new Error(msg);
    }
  };

  const title = mode === "all" ? "All products" : categoryPathTitle(categoryPath);

  const breadcrumb =
    mode === "all"
      ? [{ label: "Products" }]
      : [
          { label: "Products", href: "/products" },
          ...categoryPath.map((crumb) => ({ label: crumb.label })),
        ];

  return (
    <div className="app-container py-6 sm:py-8">
      <ProductToolbar
        title={title}
        breadcrumb={breadcrumb}
        productCount={totalProducts}
        rangeLabel={rangeLabel}
        searchInput={searchInput}
        onSearchChange={setSearchInput}
        onSearchSubmit={() => {
          clearImageSearch();
          updateUrl({ q: searchInput.trim() || null, page: 1 });
        }}
        onImageSearch={runImageSearch}
        imageSearchBusy={imageSearch.busy}
        imageSearchDisabled={false}
        suggestions={suggestions}
        onPickSuggestion={(item) => {
          clearImageSearch();
          setSearchInput(item.title);
          updateUrl({ q: item.title, page: 1 });
        }}
        sort={filters.sort}
        onSortChange={(sort) => updateUrl({ sort, page: 1 })}
        view={view}
        onViewChange={setView}
        wishlistCount={wishlist.count}
        compareCount={compare.count}
        onOpenFilters={() => setMobileFiltersOpen(true)}
        onOpenWishlist={() => setWishlistOpen(true)}
        onOpenCompare={() => setCompareOpen(true)}
      />

      <ActiveFilterChips
        chips={chips}
        onRemove={handleRemoveChip}
        onClearAll={handleClearFilters}
      />

      {(imageSearch.busy ||
        imageSearch.label ||
        imageSearch.error ||
        imageSearch.previewUrl) && (
        <div className="mt-4">
          <ProductImageSearchStatus
            busy={imageSearch.busy}
            label={imageSearch.label}
            error={imageSearch.error}
            resultCount={imageSearch.results.length}
            previewUrl={imageSearch.previewUrl}
            matchMethod={imageSearch.matchMethod}
            onClear={clearImageSearch}
          />
        </div>
      )}

      {hasTextSearch && hasImageSearch && !imageSearch.busy ? (
        <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-900">
          Text search is active. Clear search or use visual search only for best results.
        </p>
      ) : null}

      <div className="mt-6 flex gap-8">
        <aside
          className="hidden w-64 shrink-0 lg:block"
          aria-label="Product filters"
        >
          <div className="sticky top-24 rounded-2xl border border-line bg-white p-4 shadow-sm">
            <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-foreground-muted">
              Filters
            </h2>
            <ProductFilters
              filters={filters}
              draft={draft}
              setDraft={setDraft}
              brands={brandList}
              colors={facets.colors}
              categories={topCategories.map((c) => ({
                id: c._id,
                name: c.name,
              }))}
              onApply={handleApplyFilters}
              onClear={handleClearFilters}
              showCategory={mode === "all"}
            />
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <InlineLoadingBar
            active={isRefetching}
            label="Refreshing products"
            className="mb-4 rounded-full bg-zinc-100"
          />
          <ProductGrid
            products={listProducts}
            loading={showBlockingSpinner || searchLoading || imageSearch.busy}
            view={view}
            searchQuery={filters.q}
            wishlist={wishlist}
            compare={compare}
            onWishlist={handleWishlist}
            onCompare={handleCompare}
            onQuickView={setQuickViewProduct}
            onAddToCart={handleAddToCart}
            addingProductId={addingProductId}
            error={products?.error}
            emptyTitle={
              mode === "category" && leafCategoryLabel && !filters.q && !hasImageSearch
                ? `No products in ${leafCategoryLabel} yet`
                : undefined
            }
            emptyDescription={
              mode === "category" && leafCategoryLabel && !filters.q && !hasImageSearch
                ? "This category is empty for now. Browse all products or try another department."
                : undefined
            }
          />
          {!filters.q && !hasImageSearch && (
            <ProductPagination
              page={currentPage}
              totalPages={totalPages}
              onPageChange={(p) => updateUrl({ page: p })}
            />
          )}
        </div>
      </div>

      {/* z-[60] matches the nav's own mobile menu and clears the fixed navbar,
          which sits at z-50. At z-40 the navbar painted over the top of this
          panel, hiding its "Filters" heading and close button — they stayed
          clickable only because the navbar is pointer-events-none, so the
          controls were invisible but still live. */}
      <Transition show={mobileFiltersOpen}>
        <Dialog
          as="div"
          className="relative z-[60] lg:hidden"
          onClose={setMobileFiltersOpen}
        >
          <Transition.Child
            enter="transition-opacity ease-out duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-in duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-zinc-900/40" />
          </Transition.Child>
          <div className="fixed inset-0 flex">
            <Transition.Child
              enter="transition ease-out duration-200 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in duration-150 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative flex h-full w-full max-w-sm flex-col bg-white shadow-xl">
                <div className="flex items-center justify-between border-b border-line px-4 py-4">
                  <Dialog.Title className="text-lg font-bold">Filters</Dialog.Title>
                  <button
                    type="button"
                    onClick={() => setMobileFiltersOpen(false)}
                    aria-label="Close filters"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto px-4">
                  <ProductFilters
                    filters={filters}
                    draft={draft}
                    setDraft={setDraft}
                    brands={brandList}
                    colors={facets.colors}
                    categories={topCategories.map((c) => ({
                      id: c._id,
                      name: c.name,
                    }))}
                    onApply={handleApplyFilters}
                    onClear={handleClearFilters}
                    showCategory={mode === "all"}
                  />
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>

      <ProductQuickView
        product={quickViewProduct}
        open={Boolean(quickViewProduct)}
        onClose={() => setQuickViewProduct(null)}
        onAddToCart={handleAddToCart}
      />

      <ProductWishlistDrawer
        open={wishlistOpen}
        items={wishlist.items}
        onClose={() => setWishlistOpen(false)}
        onRemove={wishlist.remove}
        onClear={wishlist.clear}
        onAddToCart={handleAddToCart}
      />

      <ProductCompareDrawer
        open={compareOpen}
        items={compare.items}
        onClose={() => setCompareOpen(false)}
        onRemove={compare.remove}
        onClear={compare.clear}
      />
    </div>
  );
}
