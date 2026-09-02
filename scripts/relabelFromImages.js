/**
 * Repairs seed data where product categories/titles do not match their images.
 *
 * scripts/seedFull.js assigns each image file a category round-robin
 * (`leaves[index % leaves.length]`), so a belt photo can end up titled
 * "Modern Sneakers 001". This re-derives each product's category from what its
 * stored image actually depicts, using the same Hugging Face classifier the
 * app's visual search uses.
 *
 * Dry run (default):  node scripts/relabelFromImages.js
 * Apply:              node scripts/relabelFromImages.js --apply
 */
require("dotenv").config({ path: ".env.local" });
const crypto = require("crypto");
const fs = require("fs");
const mongoose = require("mongoose");
const Product = require("../src/server/models/product.model");
const Category = require("../src/server/models/category.model");

const APPLY = process.argv.includes("--apply");
const HF_TOKEN = process.env.HF_TOKEN;
const HF_API_BASE =
  process.env.HF_API_BASE || "https://router.huggingface.co/hf-inference/models";
const HF_MODEL = process.env.HF_CLASSIFY_MODEL || "google/mobilenet_v2_1.0_224";
// Below this the model is guessing; leave the product alone rather than
// trade one wrong category for another.
const MIN_SCORE = Number(process.env.RELABEL_MIN_SCORE || 0.35);
const CACHE_FILE = require("path").join(__dirname, ".relabel-cache.json");

// ImageNet-1k class -> catalog leaf. Matched as a substring of the raw label,
// which arrives comma-separated (e.g. "sunglasses, dark glasses, shades").
const LABEL_TO_LEAF = [
  [/running shoe|sneaker|tennis shoe|cleat/i, "Sneakers"],
  [/cowboy boot|\bboot\b|half boot/i, "Boots"],
  [/loafer|oxford|moccasin/i, "Loafers"],
  [/sandal|clog|sabot|geta|patten|slipper/i, "Flats"],
  [/high heel|\bpump\b|stiletto/i, "Heels"],
  [/backpack|knapsack|purse|handbag|mailbag|shopping basket|tote|wallet/i, "Bags"],
  [/sunglass|dark glasses|shades|spectacle/i, "Sunglasses"],
  [/jersey|t-shirt|tee shirt|sweatshirt|cardigan|pajama/i, "Shirts"],
  [/suit|trench coat|fur coat|lab coat|poncho|cloak|kimono|jean|denim|windbreaker|jacket|sweater/i, "Jackets"],
];

function leafFor(labels) {
  for (const { label, score } of labels) {
    for (const [rx, leaf] of LABEL_TO_LEAF) {
      if (rx.test(label)) return score >= MIN_SCORE ? { leaf, via: label, score } : null;
    }
  }
  return null;
}

async function classify(buf, attempt = 0) {
  const res = await fetch(`${HF_API_BASE}/${HF_MODEL}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${HF_TOKEN}`, "Content-Type": "application/octet-stream" },
    body: buf,
  });
  if (res.status === 429 || res.status === 503) {
    if (attempt >= 4) throw new Error(`HF ${res.status} after retries`);
    const wait = 2000 * (attempt + 1);
    console.log(`    HF ${res.status}, retrying in ${wait}ms...`);
    await new Promise((r) => setTimeout(r, wait));
    return classify(buf, attempt + 1);
  }
  if (!res.ok) throw new Error(`HF ${res.status}: ${(await res.text()).slice(0, 120)}`);
  const raw = await res.json();
  return (Array.isArray(raw) ? raw : []).map((r) => ({ label: String(r.label), score: r.score }));
}

(async () => {
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

  const products = await Product.find({}).select("title imageUrl category description photo").lean();

  // One HF call per distinct image, not per product.
  const groups = new Map();
  for (const p of products) {
    const h = crypto.createHash("sha1").update(String(p.imageUrl || "")).digest("hex");
    if (!groups.has(h)) groups.set(h, { url: p.imageUrl, products: [] });
    groups.get(h).products.push(p);
  }
  console.log(`${products.length} products, ${groups.size} distinct images -> ${groups.size} HF calls\n`);

  const cache = fs.existsSync(CACHE_FILE)
    ? new Map(Object.entries(JSON.parse(fs.readFileSync(CACHE_FILE, "utf8"))))
    : new Map();
  const predictions = new Map(cache);
  let i = 0;
  for (const [h, g] of groups) {
    i += 1;
    if (predictions.has(h)) continue; // cached
    const m = String(g.url || "").match(/^data:([^;]+);base64,(.+)$/);
    if (!m) { console.log(`[${i}/${groups.size}] skip (not an embedded image)`); continue; }
    try {
      const labels = await classify(Buffer.from(m[2], "base64"));
      predictions.set(h, labels);
      const top = labels[0];
      console.log(`[${i}/${groups.size}] x${String(g.products.length).padStart(2)}  ${top ? `${top.label} (${top.score.toFixed(2)})` : "no label"}`);
    } catch (e) {
      console.log(`[${i}/${groups.size}] FAILED: ${e.message}`);
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  fs.writeFileSync(CACHE_FILE, JSON.stringify(Object.fromEntries(predictions), null, 0));

  // Build the change set.
  const GENERATED = /^(\S+)\s+(.*?)\s+(\d{3})$/;
  const changes = [];
  const unmapped = [];
  for (const [h, g] of groups) {
    const labels = predictions.get(h);
    if (!labels) continue;
    const hit = leafFor(labels);
    for (const p of g.products) {
      const cur = byId.get(String(p.category));
      const m = GENERATED.exec(p.title || "");
      if (!m) continue; // curated product, leave alone
      if (!hit) { unmapped.push({ p, top: labels[0], curName: cur?.name }); continue; }
      if (cur?.name === hit.leaf) continue; // already correct
      const leaf = leaves.get(hit.leaf);
      if (!leaf) continue;
      changes.push({
        _id: p._id,
        from: cur?.name,
        to: hit.leaf,
        via: hit.via,
        oldTitle: p.title,
        newTitle: `${m[1]} ${leaf.l3} ${m[3]}`,
        newDescription: `${m[1]} ${leaf.l3.toLowerCase()} from the ${leaf.l1}/${leaf.l2} collection. Comfortable, durable, and made for everyday wear.`,
        categoryId: leaf.category._id,
      });
    }
  }

  console.log(`\n=== ${changes.length} products would be recategorised ===`);
  for (const c of changes.slice(0, 40)) {
    console.log(`  ${c.oldTitle.padEnd(26)} ${String(c.from).padEnd(15)} -> ${String(c.to).padEnd(15)} (${c.via.split(",")[0]})`);
  }
  if (changes.length > 40) console.log(`  ... and ${changes.length - 40} more`);

  if (unmapped.length) {
    console.log(`\n=== ${unmapped.length} products whose image matches NO catalog category ===`);
    const byLabel = new Map();
    for (const u of unmapped) {
      const k = (u.top?.label || "?").split(",")[0];
      byLabel.set(k, (byLabel.get(k) || 0) + 1);
    }
    [...byLabel.entries()].sort((a, b) => b[1] - a[1])
      .forEach(([l, n]) => console.log(`  x${String(n).padStart(2)}  ${l}`));
  }

  if (!APPLY) {
    console.log("\nDRY RUN — nothing written. Re-run with --apply to commit these changes.");
  } else {
    let n = 0;
    for (const c of changes) {
      await Product.updateOne(
        { _id: c._id },
        { $set: { category: c.categoryId, title: c.newTitle, description: c.newDescription } }
      );
      n += 1;
    }
    console.log(`\nAPPLIED — updated ${n} products.`);
  }
  await mongoose.disconnect();
})().catch((e) => { console.error("ERR", e.message); process.exit(1); });
