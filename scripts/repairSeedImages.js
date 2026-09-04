/**
 * Repairs seed data where a product's photo does not match its title/category.
 *
 * Two separate faults produced the current catalog, both from an older run of
 * seedFull.js:
 *
 *   1. Categories were assigned round-robin (`leaves[index % leaves.length]`),
 *      so a sunglasses photo could be titled "Deluxe Sunglasses 020" while
 *      showing a leather shoe.
 *   2. Duplicate images were detected by filename rather than content, so the
 *      same photo landed on many products — one image ended up on 29 of them.
 *
 * seedFull.js has since been fixed, but an existing database still carries the
 * bad rows. Re-seeding with --drop would repair it at the cost of deleting
 * every product, which orphans any order that references one. This repairs the
 * rows in place instead: product _ids are preserved, so orders stay intact.
 *
 * What it does:
 *   - Groups products by their embedded image (identical images = one group).
 *   - Classifies each distinct image with the same Hugging Face model the app's
 *     visual search uses, and maps the label to a catalog leaf category.
 *   - Spreads products evenly across the available images so no single photo is
 *     reused far more than any other.
 *   - Rewrites each product's category, title and description to agree with the
 *     photo it now shows, keeping the existing adjective and number so titles
 *     stay stable-looking ("Deluxe Sunglasses 020" -> "Deluxe Sneakers 020").
 *
 * Dry run (default):  node scripts/repairSeedImages.js
 * Apply:              node scripts/repairSeedImages.js --apply
 */
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env.local") });
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const mongoose = require("mongoose");
const Product = require("../src/server/models/product.model");
const Category = require("../src/server/models/category.model");

const APPLY = process.argv.includes("--apply");
const HF_TOKEN = process.env.HF_TOKEN;
const HF_API_BASE =
  process.env.HF_API_BASE || "https://router.huggingface.co/hf-inference/models";
const HF_MODEL = process.env.HF_CLASSIFY_MODEL || "google/mobilenet_v2_1.0_224";
// Below this the model is guessing; an image we cannot place confidently is
// left out of the pool rather than filed into an arbitrary category.
const MIN_SCORE = Number(process.env.RELABEL_MIN_SCORE || 0.35);
const CACHE_FILE = path.join(__dirname, ".repair-image-cache.json");

// ImageNet-1k class -> catalog leaf. The raw label is comma-separated
// (e.g. "sunglasses, dark glasses, shades"), so these match as substrings.
const LABEL_TO_LEAF = [
  [/running shoe|sneaker|tennis shoe|cleat/i, "Sneakers"],
  [/cowboy boot|\bboot\b|half boot/i, "Boots"],
  [/loafer|oxford|moccasin/i, "Loafers"],
  [/sandal|clog|sabot|geta|patten|slipper/i, "Flats"],
  [/high heel|\bpump\b|stiletto/i, "Heels"],
  [/backpack|knapsack|purse|handbag|mailbag|shopping basket|tote|wallet/i, "Bags"],
  [/sunglass|dark glasses|shades|spectacle/i, "Sunglasses"],
  [/jersey|t-shirt|tee shirt|sweatshirt|cardigan|pajama/i, "Shirts"],
  [
    /suit|trench coat|fur coat|lab coat|poncho|cloak|kimono|jean|denim|windbreaker|jacket|sweater/i,
    "Jackets",
  ],
];

function leafFor(labels) {
  for (const { label, score } of labels || []) {
    for (const [rx, leaf] of LABEL_TO_LEAF) {
      if (rx.test(label)) return score >= MIN_SCORE ? { leaf, via: label, score } : null;
    }
  }
  return null;
}

async function classify(buf, attempt = 0) {
  const res = await fetch(`${HF_API_BASE}/${HF_MODEL}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${HF_TOKEN}`,
      "Content-Type": "application/octet-stream",
    },
    body: buf,
  });
  if (res.status === 429 || res.status === 503) {
    if (attempt >= 5) throw new Error(`HF ${res.status} after retries`);
    await new Promise((r) => setTimeout(r, 2000 * (attempt + 1)));
    return classify(buf, attempt + 1);
  }
  if (!res.ok) throw new Error(`HF ${res.status}: ${(await res.text()).slice(0, 120)}`);
  const raw = await res.json();
  return (Array.isArray(raw) ? raw : []).map((r) => ({
    label: String(r.label),
    score: r.score,
  }));
}

// Generated seed titles look like "Deluxe Sunglasses 020". Curated products do
// not match this and are left untouched.
const GENERATED = /^(\S+)\s+(.*?)\s+(\d{3})$/;

async function run() {
  if (!HF_TOKEN) throw new Error("HF_TOKEN is required to classify the product images.");
  await mongoose.connect(process.env.MONGODB_URL, { serverSelectionTimeoutMS: 20000 });

  const cats = await Category.find({}).lean();
  const byId = new Map(cats.map((c) => [String(c._id), c]));
  const leaves = new Map();
  for (const c of cats.filter((x) => x.level === 3)) {
    const l2 = byId.get(String(c.parentCategory));
    const l1 = l2 && byId.get(String(l2.parentCategory));
    leaves.set(c.name, { category: c, l3: c.name, l2: l2?.name || "", l1: l1?.name || "" });
  }

  const products = await Product.find({})
    .select("title imageUrl category photo")
    .lean();

  // One classification per distinct image, not per product.
  const groups = new Map();
  for (const p of products) {
    const h = crypto.createHash("sha1").update(String(p.imageUrl || "")).digest("hex");
    if (!groups.has(h)) groups.set(h, { hash: h, url: p.imageUrl, photo: p.photo, products: [] });
    groups.get(h).products.push(p);
  }
  console.log(`${products.length} products, ${groups.size} distinct images`);

  const cache = fs.existsSync(CACHE_FILE)
    ? JSON.parse(fs.readFileSync(CACHE_FILE, "utf8"))
    : {};
  let calls = 0;
  for (const [h, g] of groups) {
    if (cache[h]) continue;
    const m = String(g.url || "").match(/^data:([^;]+);base64,(.+)$/);
    if (!m) {
      cache[h] = { labels: [], note: "not an embedded image" };
      continue;
    }
    try {
      cache[h] = { labels: await classify(Buffer.from(m[2], "base64")) };
      calls += 1;
      process.stdout.write(".");
    } catch (e) {
      cache[h] = { labels: [], error: e.message };
      process.stdout.write("x");
    }
    await new Promise((r) => setTimeout(r, 200));
  }
  if (calls) process.stdout.write("\n");
  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache));

  // Pool of usable images, bucketed by the category their picture depicts.
  const pool = new Map();
  const unusable = [];
  for (const [h, g] of groups) {
    const hit = leafFor(cache[h]?.labels);
    if (!hit || !leaves.has(hit.leaf)) {
      unusable.push({ g, top: cache[h]?.labels?.[0] });
      continue;
    }
    if (!pool.has(hit.leaf)) pool.set(hit.leaf, []);
    pool.get(hit.leaf).push({ hash: h, url: g.url, photo: g.photo, via: hit.via });
  }

  console.log("\nUsable images per category:");
  for (const [leaf, imgs] of [...pool.entries()].sort((a, b) => b[1].length - a[1].length)) {
    console.log(`  ${String(imgs.length).padStart(2)}  ${leaf}`);
  }
  const emptyLeaves = [...leaves.keys()].filter((l) => !pool.has(l));
  if (emptyLeaves.length) {
    console.log(`\nNo image depicts these categories: ${emptyLeaves.join(", ")}`);
    console.log("  Products cannot be placed there; they will move to a category that has photos.");
  }
  if (unusable.length) {
    console.log(`\n${unusable.length} image(s) match no catalog category:`);
    for (const u of unusable) {
      console.log(
        `   ${u.g.photo || "(no filename)"} -> ${u.top?.label || "?"} (${u.top?.score?.toFixed(2) ?? "-"}) on ${u.g.products.length} product(s)`
      );
    }
  }

  const totalImages = [...pool.values()].reduce((s, v) => s + v.length, 0);
  if (totalImages === 0) throw new Error("No usable images — nothing to repair.");

  // Flatten the pool into a single ordered list, then deal products onto it
  // round-robin so reuse is spread evenly instead of piling onto one photo.
  const slots = [];
  for (const [leaf, imgs] of pool) for (const img of imgs) slots.push({ leaf, img });
  slots.sort((a, b) => (a.leaf === b.leaf ? 0 : a.leaf < b.leaf ? -1 : 1));

  const generated = products
    .filter((p) => GENERATED.test(p.title || ""))
    .sort((a, b) => String(a._id).localeCompare(String(b._id)));
  const curated = products.length - generated.length;

  const changes = [];
  generated.forEach((p, i) => {
    const slot = slots[i % slots.length];
    const leaf = leaves.get(slot.leaf);
    const m = GENERATED.exec(p.title);
    const newTitle = `${m[1]} ${leaf.l3} ${m[3]}`;
    const curCat = byId.get(String(p.category));
    const sameImage =
      crypto.createHash("sha1").update(String(p.imageUrl || "")).digest("hex") === slot.img.hash;
    if (sameImage && curCat?.name === leaf.l3 && p.title === newTitle) return; // already right
    changes.push({
      _id: p._id,
      oldTitle: p.title,
      newTitle,
      from: curCat?.name,
      to: leaf.l3,
      imageUrl: slot.img.url,
      photo: slot.img.photo,
      categoryId: leaf.category._id,
      description: `${m[1]} ${leaf.l3.toLowerCase()} from the ${leaf.l1}/${leaf.l2} collection. Comfortable, durable, and made for everyday wear.`,
    });
  });

  // Reuse report.
  const perImage = new Map();
  generated.forEach((_, i) => {
    const k = slots[i % slots.length].img.hash;
    perImage.set(k, (perImage.get(k) || 0) + 1);
  });
  const counts = [...perImage.values()];
  console.log(
    `\n${generated.length} generated products over ${slots.length} images` +
      ` -> each photo used ${Math.min(...counts)}-${Math.max(...counts)} time(s).` +
      ` ${curated} curated product(s) left untouched.`
  );

  console.log(`\n=== ${changes.length} products would change ===`);
  for (const c of changes.slice(0, 25)) {
    console.log(
      `  ${String(c.oldTitle).padEnd(26)} ${String(c.from).padEnd(14)} -> ${String(c.to).padEnd(14)} ${c.newTitle}`
    );
  }
  if (changes.length > 25) console.log(`  ... and ${changes.length - 25} more`);

  if (!APPLY) {
    console.log("\nDRY RUN — nothing written. Re-run with --apply to commit.");
  } else {
    let n = 0;
    for (const c of changes) {
      await Product.updateOne(
        { _id: c._id },
        {
          $set: {
            category: c.categoryId,
            title: c.newTitle,
            description: c.description,
            imageUrl: c.imageUrl,
            photo: c.photo,
          },
        }
      );
      n += 1;
    }
    console.log(`\nAPPLIED — updated ${n} products.`);
  }

  await mongoose.disconnect();
}

if (require.main === module) {
  run().catch((e) => {
    console.error("Repair failed:", e.message);
    process.exit(1);
  });
}

module.exports = { run };
