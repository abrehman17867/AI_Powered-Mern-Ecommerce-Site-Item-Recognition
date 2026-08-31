/** Resolve Mongo category ids from /:l1/:l2/:l3 routes into display labels. */
export function buildCategoryPathLabels(routeParams, categories = []) {
  const ids = [
    routeParams?.lavelOne,
    routeParams?.lavelTwo,
    routeParams?.lavelThree,
  ].filter(Boolean);

  if (!ids.length) return [];

  const byId = new Map(
    (categories || []).map((cat) => [String(cat._id), cat])
  );

  return ids.map((id) => {
    const cat = byId.get(String(id));
    const label = cat?.name?.trim() || "Category";
    return { id: String(id), label };
  });
}

export function categoryPathTitle(pathLabels) {
  if (!pathLabels?.length) return "Shop";
  return pathLabels.map((p) => p.label).join(" / ");
}

export function leafCategoryName(pathLabels) {
  if (!pathLabels?.length) return "";
  return pathLabels[pathLabels.length - 1]?.label || "";
}
