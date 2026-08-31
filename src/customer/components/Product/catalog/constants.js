export const SORT_OPTIONS = [
  { id: "featured", label: "Featured", query: "rating" },
  { id: "newest", label: "Newest", query: "newest" },
  { id: "price_low", label: "Price: Low to High", query: "price_low" },
  { id: "price_high", label: "Price: High to Low", query: "price_high" },
  { id: "discount", label: "Highest Discount", query: "discount" },
  { id: "rating", label: "Best Rating", query: "rating" },
  { id: "name_asc", label: "Name: A–Z", query: "name_asc" },
  { id: "name_desc", label: "Name: Z–A", query: "name_desc" },
];

export const COLOR_SWATCHES = [
  { value: "white", label: "White", hex: "#f8fafc" },
  { value: "black", label: "Black", hex: "#18181b" },
  { value: "blue", label: "Blue", hex: "#3b82f6" },
  { value: "brown", label: "Brown", hex: "#92400e" },
  { value: "green", label: "Green", hex: "#22c55e" },
  { value: "red", label: "Red", hex: "#ef4444" },
  { value: "yellow", label: "Yellow", hex: "#eab308" },
  { value: "gray", label: "Gray", hex: "#9ca3af" },
  { value: "pink", label: "Pink", hex: "#ec4899" },
];

export const SIZE_OPTIONS = ["XS", "S", "M", "L", "XL", "XXL"];

export const PRICE_PRESETS = [
  { value: "0-50", label: "Under $50", min: 0, max: 50 },
  { value: "50-100", label: "$50 – $100", min: 50, max: 100 },
  { value: "100-150", label: "$100 – $150", min: 100, max: 150 },
  { value: "150-200", label: "$150 – $200", min: 150, max: 200 },
  { value: "200-99999", label: "$200+", min: 200, max: 99999 },
];

export const DISCOUNT_OPTIONS = [
  { value: "10", label: "10%+ off" },
  { value: "20", label: "20%+ off" },
  { value: "30", label: "30%+ off" },
  { value: "50", label: "50%+ off" },
];

export const STOCK_OPTIONS = [
  { value: "in_stock", label: "In stock" },
  { value: "out_of_stock", label: "Out of stock" },
];

/** 3 per page — matches grid columns; pagination visible with small catalogs */
export const PAGE_SIZE = 6;
export const VIEW_GRID = "grid";
export const VIEW_LIST = "list";
