"use client";

export function highlightMatch(text, query) {
  if (!query?.trim() || !text) return text;
  const q = query.trim();
  const idx = text.toLowerCase().indexOf(q.toLowerCase());
  if (idx === -1) return text;
  const before = text.slice(0, idx);
  const match = text.slice(idx, idx + q.length);
  const after = text.slice(idx + q.length);
  return (
    <>
      {before}
      <mark className="rounded bg-amber-100 px-0.5 text-inherit">{match}</mark>
      {after}
    </>
  );
}
