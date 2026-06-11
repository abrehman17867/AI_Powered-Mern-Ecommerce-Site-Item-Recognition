/** Mongo / API category document id as string */
function categoryIdString(cat) {
  if (!cat || cat._id == null) return "";
  return String(cat._id).trim();
}

/** Parent reference from API (ObjectId string, ObjectId, or populated { _id }) */
function parentIdString(cat) {
  const p = cat?.parentCategory;
  if (p == null || p === undefined) return "";
  if (typeof p === "object" && p._id != null) return String(p._id).trim();
  return String(p).trim();
}

function levelOf(cat) {
  const n = Number(cat?.level);
  return Number.isFinite(n) ? n : cat?.level;
}

const DEFAULT_FEATURE_IMG =
  "https://images.pexels.com/photos/5632402/pexels-photo-5632402.jpeg?auto=compress&cs=tinysrgb&w=600";

function buildStrictTree(categories) {
  const level1 = categories
    .filter((c) => levelOf(c) === 1)
    .sort((a, b) =>
      String(a.name || "").localeCompare(String(b.name || ""), undefined, { sensitivity: "base" })
    );

  if (!level1.length) return null;

  const built = level1.map((cat1) => {
    const id1 = categoryIdString(cat1);
    const sections = categories
      .filter((c) => levelOf(c) === 2 && parentIdString(c) === id1)
      .sort((a, b) =>
        String(a.name || "").localeCompare(String(b.name || ""), undefined, { sensitivity: "base" })
      )
      .map((cat2) => {
        const id2 = categoryIdString(cat2);
        const items = categories
          .filter((c) => levelOf(c) === 3 && parentIdString(c) === id2)
          .sort((a, b) =>
            String(a.name || "").localeCompare(String(b.name || ""), undefined, { sensitivity: "base" })
          )
          .map((cat3) => ({
            id: categoryIdString(cat3),
            name: cat3.name,
            href: "#",
          }));
        return {
          id: id2,
          name: cat2.name,
          items,
        };
      })
      .filter((s) => s.items.length > 0);

    return {
      id: id1,
      name: cat1.name,
      featured: [
        {
          name: `Shop ${cat1.name}`,
          href: "/products",
          imageSrc: DEFAULT_FEATURE_IMG,
          imageAlt: cat1.name,
        },
      ],
      sections,
    };
  });

  const categoriesOut = built.filter((c) => c.sections.length > 0);
  if (!categoriesOut.length) return null;
  return { categories: categoriesOut };
}

/**
 * When no L3 leaves exist yet, still surface L1 → L2 so the navbar is usable;
 * "Browse …" sends shoppers to /products until leaves are seeded.
 */
function buildLooseTree(categories) {
  if (!Array.isArray(categories) || categories.length === 0) return null;

  const level1 = categories
    .filter((c) => levelOf(c) === 1)
    .sort((a, b) =>
      String(a.name || "").localeCompare(String(b.name || ""), undefined, { sensitivity: "base" })
    );
  if (!level1.length) return null;

  const built = level1.map((cat1) => {
    const id1 = categoryIdString(cat1);
    const l2 = categories.filter((c) => levelOf(c) === 2 && parentIdString(c) === id1);
    if (!l2.length) return null;

    const sections = l2
      .sort((a, b) =>
        String(a.name || "").localeCompare(String(b.name || ""), undefined, { sensitivity: "base" })
      )
      .map((cat2) => {
        const id2 = categoryIdString(cat2);
        const items = categories
          .filter((c) => levelOf(c) === 3 && parentIdString(c) === id2)
          .sort((a, b) =>
            String(a.name || "").localeCompare(String(b.name || ""), undefined, { sensitivity: "base" })
          )
          .map((cat3) => ({
            id: categoryIdString(cat3),
            name: cat3.name,
            href: "#",
          }));
        if (items.length > 0) {
          return { id: id2, name: cat2.name, items };
        }
        return {
          id: id2,
          name: cat2.name,
          items: [
            {
              id: `browse-${id2}`,
              name: `Browse ${cat2.name}`,
              href: "/products",
              browseProducts: true,
            },
          ],
        };
      });

    return {
      id: id1,
      name: cat1.name,
      featured: [
        {
          name: `Shop ${cat1.name}`,
          href: "/products",
          imageSrc: DEFAULT_FEATURE_IMG,
          imageAlt: cat1.name,
        },
      ],
      sections,
    };
  });

  const categoriesOut = built.filter(Boolean);
  if (!categoriesOut.length) return null;
  return { categories: categoriesOut };
}

/**
 * Build megamenu shape from flat GET /api/products/categories list (level 1–3).
 * URL pattern: /:level1Id/:level2Id/:level3Id (leaf drives product API).
 */
export function buildNavigationFromCategories(categories) {
  if (!Array.isArray(categories) || categories.length === 0) return null;
  const strict = buildStrictTree(categories);
  if (strict?.categories?.length) return strict;
  return buildLooseTree(categories);
}
