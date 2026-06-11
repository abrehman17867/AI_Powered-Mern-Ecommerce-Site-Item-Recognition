import React, { useMemo } from "react";
import {
  COLOR_SWATCHES,
  DISCOUNT_OPTIONS,
  PRICE_PRESETS,
  SIZE_OPTIONS,
  STOCK_OPTIONS,
} from "./constants";
import { classNames } from "../../../../utils/classNames";
import Button from "../../../../components/ui/Button";

function FilterSection({ title, children, defaultOpen = true }) {
  const [open, setOpen] = React.useState(defaultOpen);
  return (
    <div className="border-b border-line py-4">
      <button
        type="button"
        className="flex w-full items-center justify-between text-left text-sm font-semibold text-foreground"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        {title}
        <span className="text-foreground-muted">{open ? "−" : "+"}</span>
      </button>
      {open && <div className="mt-3">{children}</div>}
    </div>
  );
}

export default function ProductFilters({
  filters,
  draft,
  setDraft,
  brands,
  categories,
  onApply,
  onClear,
  showCategory = true,
}) {
  const toggleArray = (key, value) => {
    setDraft((prev) => {
      const arr = [...(prev[key] || [])];
      const i = arr.indexOf(value);
      if (i >= 0) arr.splice(i, 1);
      else arr.push(value);
      return { ...prev, [key]: arr };
    });
  };

  const uniqueBrands = useMemo(() => {
    const fromProducts = brands || [];
    const set = new Set(fromProducts.filter(Boolean));
    return [...set].sort();
  }, [brands]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto px-1">
        {showCategory && categories?.length > 0 && (
          <FilterSection title="Category">
            <ul className="space-y-2">
              {categories.map((cat) => (
                <li key={cat.id || cat._id || cat.name}>
                  <label className="flex cursor-pointer items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name="category"
                      checked={draft.category === (cat.id || cat.name)}
                      onChange={() =>
                        setDraft((p) => ({ ...p, category: cat.id || cat.name }))
                      }
                      className="h-4 w-4 border-line text-brand-500 focus:ring-brand-500"
                    />
                    <span>{cat.name}</span>
                  </label>
                </li>
              ))}
            </ul>
          </FilterSection>
        )}

        <FilterSection title="Price">
          <ul className="space-y-2">
            {PRICE_PRESETS.map((opt) => (
              <li key={opt.value}>
                <label className="flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="price"
                    checked={draft.price === opt.value}
                    onChange={() => setDraft((p) => ({ ...p, price: opt.value }))}
                    className="h-4 w-4 border-line text-brand-500 focus:ring-brand-500"
                  />
                  {opt.label}
                </label>
              </li>
            ))}
          </ul>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <label className="text-xs text-foreground-muted">
              Min
              <input
                type="number"
                min={0}
                className="mt-1 w-full rounded-lg border border-line px-2 py-1.5 text-sm"
                value={draft.minPriceCustom ?? ""}
                onChange={(e) =>
                  setDraft((p) => ({ ...p, minPriceCustom: e.target.value }))
                }
              />
            </label>
            <label className="text-xs text-foreground-muted">
              Max
              <input
                type="number"
                min={0}
                className="mt-1 w-full rounded-lg border border-line px-2 py-1.5 text-sm"
                value={draft.maxPriceCustom ?? ""}
                onChange={(e) =>
                  setDraft((p) => ({ ...p, maxPriceCustom: e.target.value }))
                }
              />
            </label>
          </div>
        </FilterSection>

        <FilterSection title="Brand">
          <ul className="max-h-40 space-y-2 overflow-y-auto">
            {uniqueBrands.length === 0 && (
              <p className="text-xs text-foreground-muted">No brands in current results</p>
            )}
            {uniqueBrands.map((brand) => (
              <li key={brand}>
                <label className="flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={draft.brand?.includes(brand)}
                    onChange={() => toggleArray("brand", brand)}
                    className="h-4 w-4 rounded border-line text-brand-500 focus:ring-brand-500"
                  />
                  {brand}
                </label>
              </li>
            ))}
          </ul>
        </FilterSection>

        <FilterSection title="Color">
          <div className="flex flex-wrap gap-2">
            {COLOR_SWATCHES.map((c) => {
              const active = draft.color?.includes(c.value);
              return (
                <button
                  key={c.value}
                  type="button"
                  title={c.label}
                  aria-pressed={active}
                  onClick={() => toggleArray("color", c.value)}
                  className={classNames(
                    "h-8 w-8 rounded-full border-2 shadow-sm transition",
                    active ? "border-brand-500 ring-2 ring-brand-200" : "border-white"
                  )}
                  style={{ backgroundColor: c.hex }}
                />
              );
            })}
          </div>
        </FilterSection>

        <FilterSection title="Size">
          <div className="flex flex-wrap gap-2">
            {SIZE_OPTIONS.map((size) => {
              const active = draft.size?.includes(size);
              return (
                <button
                  key={size}
                  type="button"
                  aria-pressed={active}
                  onClick={() => toggleArray("size", size)}
                  className={classNames(
                    "min-w-[2.5rem] rounded-lg border px-2 py-1.5 text-xs font-semibold transition",
                    active
                      ? "border-brand-500 bg-brand-500 text-white"
                      : "border-line bg-white hover:border-brand-300"
                  )}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </FilterSection>

        <FilterSection title="Discount">
          <ul className="space-y-2">
            {DISCOUNT_OPTIONS.map((opt) => (
              <li key={opt.value}>
                <label className="flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="discount"
                    checked={draft.discount === opt.value}
                    onChange={() => setDraft((p) => ({ ...p, discount: opt.value }))}
                    className="h-4 w-4 border-line text-brand-500 focus:ring-brand-500"
                  />
                  {opt.label}
                </label>
              </li>
            ))}
          </ul>
        </FilterSection>

        <FilterSection title="Availability">
          <ul className="space-y-2">
            {STOCK_OPTIONS.map((opt) => (
              <li key={opt.value}>
                <label className="flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="stock"
                    checked={draft.stock === opt.value}
                    onChange={() => setDraft((p) => ({ ...p, stock: opt.value }))}
                    className="h-4 w-4 border-line text-brand-500 focus:ring-brand-500"
                  />
                  {opt.label}
                </label>
              </li>
            ))}
          </ul>
        </FilterSection>
      </div>

      <div className="sticky bottom-0 flex items-center gap-2 border-t border-line bg-white py-3">
        <Button
          variant="secondary"
          size="sm"
          className="shrink-0 whitespace-nowrap"
          onClick={onClear}
        >
          Clear
        </Button>
        <Button size="sm" className="min-w-0 flex-1 whitespace-nowrap" onClick={onApply}>
          Apply filters
        </Button>
      </div>
    </div>
  );
}
