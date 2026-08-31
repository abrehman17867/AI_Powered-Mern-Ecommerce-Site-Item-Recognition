function parentIdString(cat) {
  const p = cat?.parentCategory;
  if (p == null) return "";
  if (typeof p === "object" && p._id != null) return String(p._id);
  return String(p);
}

/** First L3 leaf path for a level-1 department name, else /products with search. */
export function categoryTileHref(categories, tileName) {
  if (!Array.isArray(categories) || categories.length === 0) {
    return `/products?q=${encodeURIComponent(tileName)}`;
  }

  const l1 = categories.find(
    (c) => Number(c.level) === 1 && c.name?.toLowerCase() === tileName.toLowerCase()
  );
  if (l1) {
    const id1 = String(l1._id);
    const l2 = categories.find(
      (c) => Number(c.level) === 2 && parentIdString(c) === id1
    );
    if (l2) {
      const id2 = String(l2._id);
      const l3 = categories.find(
        (c) => Number(c.level) === 3 && parentIdString(c) === id2
      );
      if (l3) return `/${id1}/${id2}/${String(l3._id)}`;
    }
  }

  const byName = categories.find(
    (c) => c.name?.toLowerCase() === tileName.toLowerCase()
  );
  if (byName && Number(byName.level) === 3) {
    const id3 = String(byName._id);
    const id2 = parentIdString(byName);
    const l2 = categories.find((c) => String(c._id) === id2);
    const id1 = l2 ? parentIdString(l2) : "";
    if (id1 && id2) return `/${id1}/${id2}/${id3}`;
  }

  return `/products?q=${encodeURIComponent(tileName)}`;
}
