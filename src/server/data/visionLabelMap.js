/**
 * Maps generic vision model labels → terms that exist in this store's catalog.
 * Used when CLIP is unavailable or as extra keywords after classification.
 */
const VISION_LABEL_MAP = {
  sandal: ["sandal", "slide", "flat", "heel", "shoe", "footwear", "sneaker", "loafer"],
  sandals: ["sandal", "flat", "heel", "shoe", "footwear"],
  "running shoe": ["sneaker", "runner", "running", "athletic", "shoe"],
  sneaker: ["sneaker", "runner", "running", "athletic", "shoe"],
  "tennis shoe": ["sneaker", "running", "athletic", "shoe"],
  boot: ["boot", "boots", "footwear", "shoe"],
  loafer: ["loafer", "formal", "leather", "shoe"],
  heel: ["heel", "heels", "pump", "shoe"],
  "high heel": ["heel", "heels", "pump"],
  flat: ["flat", "flats", "ballet", "shoe"],
  pump: ["heel", "heels", "pump"],
  slipper: ["flat", "slide", "sandal", "shoe"],
  mule: ["heel", "flat", "slide", "shoe"],
  handbag: ["bag", "tote", "handbag", "purse"],
  purse: ["bag", "tote", "handbag"],
  backpack: ["bag", "backpack"],
  tote: ["tote", "bag"],
  sunglasses: ["sunglass", "sunglasses", "eyewear", "accessories"],
  jersey: ["shirt", "tee", "top", "clothing"],
  "t-shirt": ["shirt", "tee", "top", "clothing"],
  shirt: ["shirt", "top", "clothing"],
  jacket: ["jacket", "coat", "outerwear", "clothing"],
  coat: ["jacket", "coat", "outerwear"],
};

/** CLIP zero-shot labels aligned with seed catalog + common uploads */
const CATALOG_CLIP_LABELS = [
  "men's sneakers",
  "women's running shoes",
  "leather loafers",
  "ankle boots",
  "high heel shoes",
  "ballet flats",
  "sandals or slides",
  "men's dress shirt",
  "performance t-shirt",
  "winter jacket",
  "women's handbag or tote",
  "sunglasses",
];

const CLIP_LABEL_TO_SEARCH = {
  "men's sneakers": ["sneaker", "runner", "urban", "stride", "shoe"],
  "women's running shoes": ["running", "sneaker", "shoe", "athletic"],
  "leather loafers": ["loafer", "leather", "monarch", "formal", "shoe"],
  "ankle boots": ["boot", "boots", "shoe", "footwear"],
  "high heel shoes": ["heel", "heels", "velora", "elegant", "shoe"],
  "ballet flats": ["flat", "flats", "shoe", "footwear"],
  "sandals or slides": ["sandal", "flat", "heel", "slide", "shoe", "sneaker", "loafer"],
  "men's dress shirt": ["shirt", "tee", "pulse", "flexfit", "clothing"],
  "performance t-shirt": ["shirt", "tee", "pulse", "performance", "clothing"],
  "winter jacket": ["jacket", "outerwear", "clothing"],
  "women's handbag or tote": ["tote", "bag", "nexa", "handbag"],
  sunglasses: ["sunglass", "sunglasses", "accessories"],
};

function normalizeLabel(label) {
  return String(label || "")
    .toLowerCase()
    .replace(/_/g, " ")
    .trim();
}

function expandVisionLabel(label) {
  const key = normalizeLabel(label);
  const mapped = VISION_LABEL_MAP[key];
  const words = key.split(/\s+/).filter((w) => w.length > 2);
  const set = new Set([...words, ...(mapped || [])]);
  return [...set];
}

function expandClipLabels(scoredLabels) {
  const keywords = new Set();
  const labels = [];
  for (const { label, score } of scoredLabels) {
    if (score < 0.08) continue;
    labels.push(label);
    const terms = CLIP_LABEL_TO_SEARCH[label] || [label];
    terms.forEach((t) => keywords.add(t.toLowerCase()));
    label
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 2 && !["men", "women", "or"].includes(w))
      .forEach((w) => keywords.add(w));
  }
  return { keywords: [...keywords], labels };
}

module.exports = {
  CATALOG_CLIP_LABELS,
  expandVisionLabel,
  expandClipLabels,
  normalizeLabel,
};
