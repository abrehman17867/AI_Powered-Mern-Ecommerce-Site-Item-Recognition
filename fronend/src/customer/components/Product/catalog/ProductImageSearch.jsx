import React, { useRef } from "react";
import { CameraIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { classNames } from "../../../../utils/classNames";
import Button from "../../../../components/ui/Button";

/** Camera control embedded in the catalog search bar. */
export function ProductImageSearchButton({ busy, onSelectFile, disabled }) {
  const inputRef = useRef(null);

  return (
    <>
      <button
        type="button"
        disabled={disabled || busy}
        onClick={() => inputRef.current?.click()}
        className={classNames(
          "absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-foreground-muted transition hover:bg-orange-50 hover:text-orange-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 disabled:opacity-50",
          busy && "animate-pulse text-orange-500"
        )}
        aria-label="Search products by image"
        title="Search by image"
      >
        <CameraIcon className="h-5 w-5" aria-hidden />
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onSelectFile?.(file);
          e.target.value = "";
        }}
      />
    </>
  );
}

/** Status banners after a visual search. */
export function ProductImageSearchStatus({
  busy,
  label,
  error,
  resultCount,
  previewUrl,
  matchMethod,
  onClear,
}) {
  if (!busy && !label && !error && resultCount === 0 && !previewUrl) return null;

  return (
    <div
      className="space-y-2 rounded-2xl border border-line bg-white p-4 shadow-sm"
      role="region"
      aria-label="Visual search results"
      aria-live="polite"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt=""
              className="h-14 w-14 shrink-0 rounded-xl border border-line object-cover"
            />
          ) : null}
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground">Visual search</p>
            {busy ? (
              <p className="mt-0.5 text-sm text-foreground-muted">
                Analyzing your photo…
              </p>
            ) : null}
            {label && !busy ? (
              <p className="mt-0.5 text-sm text-foreground-muted">
                {matchMethod === "clip" ? "Store match" : "Detected"}:{" "}
                <span className="font-medium text-foreground">{label}</span>
                {resultCount > 0 ? (
                  <>
                    {" "}
                    · {resultCount} product{resultCount === 1 ? "" : "s"}
                  </>
                ) : null}
              </p>
            ) : null}
            {error && !busy ? (
              <p className="mt-0.5 text-sm text-red-600">{error}</p>
            ) : null}
            {!busy && !error && label && resultCount === 0 ? (
              <p className="mt-0.5 text-sm text-amber-700">
                No catalog products matched this label. Try another photo or use text
                search.
              </p>
            ) : null}
          </div>
        </div>
        {!busy && (label || error || previewUrl) ? (
          <Button type="button" variant="secondary" size="sm" onClick={onClear}>
            <XMarkIcon className="mr-1 h-4 w-4" aria-hidden />
            Clear
          </Button>
        ) : null}
      </div>
    </div>
  );
}
