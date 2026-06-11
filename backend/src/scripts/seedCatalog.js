const { connectDb } = require("../config/db");
const Category = require("../models/category.model");
const Product = require("../models/product.model");
const seedCatalog = require("../data/seedCatalog");

function slugify(input) {
  return String(input || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function upsertCategory({ name, level, parentCategory }) {
  const filter =
    level === 1
      ? { name, level: 1, $or: [{ parentCategory: null }, { parentCategory: { $exists: false } }] }
      : { name, level, parentCategory };

  return Category.findOneAndUpdate(
    filter,
    {
      name,
      level,
      parentCategory: parentCategory || undefined,
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
}

async function ensureCategoryTree() {
  const map = new Map();
  let createdOrUpdated = 0;

  for (const l1 of seedCatalog.categories) {
    const c1 = await upsertCategory({ name: l1.name, level: 1 });
    map.set(slugify(l1.name), c1);
    createdOrUpdated += 1;

    for (const l2 of l1.children || []) {
      const c2 = await upsertCategory({
        name: l2.name,
        level: 2,
        parentCategory: c1._id,
      });
      map.set(`${slugify(l1.name)}/${slugify(l2.name)}`, c2);
      createdOrUpdated += 1;

      for (const l3Name of l2.children || []) {
        const c3 = await upsertCategory({
          name: l3Name,
          level: 3,
          parentCategory: c2._id,
        });
        map.set(
          `${slugify(l1.name)}/${slugify(l2.name)}/${slugify(l3Name)}`,
          c3
        );
        createdOrUpdated += 1;
      }
    }
  }

  return { map, createdOrUpdated };
}

async function upsertProducts(categoryMap) {
  let upserted = 0;
  let skipped = 0;
  for (const item of seedCatalog.products) {
    const [l1, l2, l3] = item.categoryPath || [];
    const key = `${slugify(l1)}/${slugify(l2)}/${slugify(l3)}`;
    const category = categoryMap.get(key);
    if (!category) {
      skipped += 1;
      continue;
    }

    const photo = item.imageUrl ? `${slugify(item.title)}.jpg` : "";
    await Product.findOneAndUpdate(
      { title: item.title, brand: item.brand },
      {
        title: item.title,
        brand: item.brand,
        description: item.description,
        color: item.color,
        price: item.price,
        discountedPrice: item.discountedPrice,
        discountedPersent: item.discountedPersent,
        quantity: item.quantity,
        sizes: item.sizes || [],
        category: category._id,
        imageUrl: item.imageUrl || "",
        photo,
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    upserted += 1;
  }
  return { upserted, skipped };
}

async function run() {
  const shouldReset = process.argv.includes("--drop");
  await connectDb();

  if (shouldReset) {
    await Product.deleteMany({});
    await Category.deleteMany({});
  }

  const { map, createdOrUpdated } = await ensureCategoryTree();
  const { upserted, skipped } = await upsertProducts(map);

  console.log("Seed completed");
  console.log(`Categories processed: ${createdOrUpdated}`);
  console.log(`Products upserted: ${upserted}`);
  if (skipped) {
    console.log(`Products skipped (missing category path): ${skipped}`);
  }
}

if (require.main === module) {
  run()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("Seed failed:", err.message);
      process.exit(1);
    });
}

module.exports = { run };
