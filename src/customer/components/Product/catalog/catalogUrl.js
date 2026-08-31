import { PAGE_SIZE } from "./constants";

export function parseCatalogSearch(search) {
  const params = new URLSearchParams(search);
  return {
    q: params.get("q") || "",
    color: params.get("color")?.split(",").filter(Boolean) || [],
    size: params.get("size")?.split(",").filter(Boolean) || [],
    brand: params.get("brand")?.split(",").filter(Boolean) || [],
    price: params.get("price") || "",
    discount: params.get("discount") || "",
    stock: params.get("stock") || "",
    sort: params.get("sort") || "price_low",
    page: Math.max(1, parseInt(params.get("page") || "1", 10)),
    category: params.get("category") || "",
  };
}

export function buildCatalogSearch(updates, currentSearch = "") {
  const params = new URLSearchParams(currentSearch);
  Object.entries(updates).forEach(([key, value]) => {
    if (value === null || value === undefined || value === "" || (Array.isArray(value) && value.length === 0)) {
      params.delete(key);
    } else if (Array.isArray(value)) {
      params.set(key, value.join(","));
    } else {
      params.set(key, String(value));
    }
  });
  const s = params.toString();
  return s ? `?${s}` : "";
}

export function buildApiParams(filters, mode, categorySlug) {
  const priceParts = filters.price ? filters.price.split("-").map(Number) : [0, 10000];
  const [minPrice, maxPrice] =
    priceParts.length === 2 && !Number.isNaN(priceParts[0]) ? priceParts : [0, 10000];

  return {
    category: mode === "category" ? categorySlug : filters.category || "",
    colors: (filters.color || []).join(","),
    sizes: (filters.size || []).join(","),
    brand: (filters.brand || []).join(","),
    minPrice,
    maxPrice,
    minDiscount: filters.discount || 0,
    sort: filters.sort || "price_low",
    stock: filters.stock || "",
    pageNumber: filters.page || 1,
    pageSize: PAGE_SIZE,
  };
}

export function getActiveChips(filters, brands = []) {
  const chips = [];
  filters.color?.forEach((c) => chips.push({ key: `color-${c}`, type: "color", value: c, label: c }));
  filters.size?.forEach((s) => chips.push({ key: `size-${s}`, type: "size", value: s, label: `Size ${s}` }));
  filters.brand?.forEach((b) => chips.push({ key: `brand-${b}`, type: "brand", value: b, label: b }));
  if (filters.price) chips.push({ key: "price", type: "price", value: filters.price, label: `Price ${filters.price}` });
  if (filters.discount) chips.push({ key: "discount", type: "discount", value: filters.discount, label: `${filters.discount}%+ off` });
  if (filters.stock) chips.push({ key: "stock", type: "stock", value: filters.stock, label: filters.stock === "in_stock" ? "In stock" : "Out of stock" });
  if (filters.category) {
    const name = brands.find((b) => b.id === filters.category)?.name || filters.category;
    chips.push({ key: "category", type: "category", value: filters.category, label: name });
  }
  if (filters.q) chips.push({ key: "q", type: "q", value: filters.q, label: `“${filters.q}”` });
  return chips;
}
