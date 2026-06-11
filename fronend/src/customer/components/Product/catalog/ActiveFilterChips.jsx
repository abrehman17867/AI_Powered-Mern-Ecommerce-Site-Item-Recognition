import React from "react";
import { XMarkIcon } from "@heroicons/react/20/solid";

export default function ActiveFilterChips({ chips, onRemove, onClearAll }) {
  if (!chips.length) return null;

  return (
    <div className="flex flex-wrap items-center gap-2" role="region" aria-label="Active filters">
      {chips.map((chip) => (
        <button
          key={chip.key}
          type="button"
          onClick={() => onRemove(chip)}
          className="inline-flex items-center gap-1 rounded-full border border-line bg-white px-3 py-1 text-xs font-medium text-foreground shadow-sm transition hover:border-brand-300 hover:bg-brand-50"
        >
          <span>{chip.label}</span>
          <XMarkIcon className="h-4 w-4 text-foreground-muted" aria-hidden />
          <span className="sr-only">Remove {chip.label}</span>
        </button>
      ))}
      <button
        type="button"
        onClick={onClearAll}
        className="text-xs font-semibold text-brand-600 hover:underline"
      >
        Clear all
      </button>
    </div>
  );
}
