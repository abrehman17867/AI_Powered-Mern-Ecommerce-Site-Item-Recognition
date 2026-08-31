/**
 * Full catalog seed: builds the category tree and creates a product for every
 * real image file found in src/uploads and uploadsImage, embedding each image
 * as a base64 data URI directly on the product document (imageUrl field) so
 * everything lives in MongoDB — no dependency on local disk or external hosts.
 */
const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env.local") });
const { connectDb } = require("../src/lib/db");
const Category = require("../src/server/models/category.model");
const Product = require("../src/server/models/product.model");
const seedCatalog = require("../src/server/data/seedCatalog");

const SEED_IMAGE_DIRS = String(process.env.SEED_IMAGE_DIRS || "")
  .split(",")
  .map((d) => d.trim())
  .filter(Boolean);

const MIME_BY_EXT = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

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
    { name, level, parentCategory: parentCategory || undefined },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
}

async function ensureCategoryTree() {
  const map = new Map();
  const leaves = [];

  for (const l1 of seedCatalog.categories) {
    const c1 = await upsertCategory({ name: l1.name, level: 1 });
    map.set(slugify(l1.name), c1);

    for (const l2 of l1.children || []) {
      const c2 = await upsertCategory({ name: l2.name, level: 2, parentCategory: c1._id });
      map.set(`${slugify(l1.name)}/${slugify(l2.name)}`, c2);

      for (const l3Name of l2.children || []) {
        const c3 = await upsertCategory({ name: l3Name, level: 3, parentCategory: c2._id });
        const key = `${slugify(l1.name)}/${slugify(l2.name)}/${slugify(l3Name)}`;
        map.set(key, c3);
        leaves.push({ key, l1: l1.name, l2: l2.name, l3: l3Name, category: c3 });
      }
    }
  }

  return { map, leaves };
}

async function seedCuratedProducts(categoryMap) {
  let upserted = 0;
  for (const item of seedCatalog.products) {
    const [l1, l2, l3] = item.categoryPath || [];
    const key = `${slugify(l1)}/${slugify(l2)}/${slugify(l3)}`;
    const category = categoryMap.get(key);
    if (!category) continue;

    let imageUrl = item.imageUrl || "";
    try {
      const res = await fetch(item.imageUrl);
      if (res.ok) {
        const buf = Buffer.from(await res.arrayBuffer());
        const contentType = res.headers.get("content-type") || "image/jpeg";
        imageUrl = `data:${contentType};base64,${buf.toString("base64")}`;
      }
    } catch (err) {
      console.warn(`Could not fetch ${item.imageUrl}: ${err.message}. Keeping remote URL.`);
    }

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
        imageUrl,
        photo: `${slugify(item.title)}.jpg`,
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    upserted += 1;
  }
  return upserted;
}

function collectImageFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => MIME_BY_EXT[path.extname(f).toLowerCase()])
    .map((f) => path.join(dir, f));
}

// Dedup files that share the same base name before the "-<timestamp>.ext" suffix
// (repeated test uploads of the same source photo).
function dedupByBaseName(files) {
  const seen = new Map();
  for (const f of files) {
    const base = path.basename(f).replace(/-\d{13}(\.[a-zA-Z0-9]+)$/, "$1");
    if (!seen.has(base)) seen.set(base, f);
  }
  return [...seen.values()];
}

const BRANDS = ["Stride", "Monarch", "Pulse", "Velora", "Nimbus", "Ardent", "Ridgeline", "Solace", "Kindred", "Vantage"];
const ADJECTIVES = ["Classic", "Urban", "Everyday", "Premium", "Signature", "Essential", "Modern", "Heritage", "Active", "Deluxe"];
const COLORS = ["Black", "White", "Navy", "Brown", "Grey", "Red", "Beige", "Olive", "Tan", "Charcoal"];

function seededRandom(seed) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function pick(arr, rnd) {
  return arr[Math.floor(rnd() * arr.length)];
}

async function seedGeneratedProducts(leaves) {
  const imageFiles = dedupByBaseName([
    // The original backend/ folder (which held the uploaded product photos) was
    // removed when this app moved to the repo root. The seeded catalog already
    // lives in MongoDB with its images embedded, so this is only needed to seed
    // a fresh database from scratch. Point SEED_IMAGE_DIRS at the image folders
    // (comma-separated) to do that — they are recoverable from the `prevous`
    // branch, which still has the full MERN app.
    ...SEED_IMAGE_DIRS.flatMap((dir) => collectImageFiles(path.resolve(dir))),
  ]);

  let upserted = 0;
  let index = 0;
  for (const filePath of imageFiles) {
    const leaf = leaves[index % leaves.length];
    index += 1;

    const ext = path.extname(filePath).toLowerCase();
    const mime = MIME_BY_EXT[ext] || "image/jpeg";
    const buf = fs.readFileSync(filePath);
    const imageUrl = `data:${mime};base64,${buf.toString("base64")}`;

    const rnd = seededRandom(index * 7919);
    const brand = pick(BRANDS, rnd);
    const adjective = pick(ADJECTIVES, rnd);
    const color = pick(COLORS, rnd);
    const title = `${adjective} ${leaf.l3} ${String(index).padStart(3, "0")}`;
    const price = 40 + Math.floor(rnd() * 160);
    const discountedPersent = 10 + Math.floor(rnd() * 30);
    const discountedPrice = Math.max(1, Math.round(price * (1 - discountedPersent / 100)));
    const quantity = 20 + Math.floor(rnd() * 80);

    await Product.findOneAndUpdate(
      { title, brand },
      {
        title,
        brand,
        description: `${adjective} ${leaf.l3.toLowerCase()} from the ${leaf.l1}/${leaf.l2} collection. Comfortable, durable, and made for everyday wear.`,
        color,
        price,
        discountedPrice,
        discountedPersent,
        quantity,
        sizes: [
          { name: "S", quantity: Math.floor(quantity / 3) },
          { name: "M", quantity: Math.floor(quantity / 3) },
          { name: "L", quantity: quantity - 2 * Math.floor(quantity / 3) },
        ],
        category: leaf.category._id,
        imageUrl,
        photo: path.basename(filePath),
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    upserted += 1;
  }
  return { upserted, imageCount: imageFiles.length };
}

async function run() {
  const shouldReset = process.argv.includes("--drop");
  await connectDb();

  if (shouldReset) {
    await Product.deleteMany({});
    await Category.deleteMany({});
  }

  const { map, leaves } = await ensureCategoryTree();
  const curatedCount = await seedCuratedProducts(map);
  const { upserted: generatedCount, imageCount } = await seedGeneratedProducts(leaves);

  console.log("Full seed completed");
  console.log(`Categories: ${map.size}`);
  console.log(`Curated products (embedded from Pexels): ${curatedCount}`);
  console.log(`Generated products from local images: ${generatedCount} (found ${imageCount} unique image files)`);
  console.log(`Total products: ${curatedCount + generatedCount}`);
}

if (require.main === module) {
  run()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("Full seed failed:", err);
      process.exit(1);
    });
}

module.exports = { run };
