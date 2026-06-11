const path = require("path");
const fs = require("fs");
const Category = require("../models/category.model");
const {
  CATALOG_CLIP_LABELS,
  expandVisionLabel,
  expandClipLabels,
  normalizeLabel,
} = require("../data/visionLabelMap");
const { predictImageLabel, BACKEND_ROOT } = require("./imagePredict.service");

let clipClassifier = null;
let categoryNamesCache = null;
let categoryCacheTime = 0;
const CACHE_MS = 5 * 60 * 1000;

async function loadCategoryNames() {
  if (categoryNamesCache && Date.now() - categoryCacheTime < CACHE_MS) {
    return categoryNamesCache;
  }
  const cats = await Category.find({}, { name: 1, level: 1 }).lean();
  categoryNamesCache = cats.map((c) => c.name).filter(Boolean);
  categoryCacheTime = Date.now();
  return categoryNamesCache;
}

async function classifyWithClip(absImagePath) {
  const { pipeline } = await import("@xenova/transformers");
  if (!clipClassifier) {
    clipClassifier = await pipeline(
      "zero-shot-image-classification",
      "Xenova/clip-vit-base-patch32"
    );
  }

  const dbCategories = await loadCategoryNames();
  const candidateLabels = [
    ...new Set([...CATALOG_CLIP_LABELS, ...dbCategories]),
  ].slice(0, 32);

  const raw = await clipClassifier(absImagePath, candidateLabels);

  const scored = (Array.isArray(raw) ? raw : [])
    .map((r) => ({
      label: r.label,
      score: r.score,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  return scored;
}

/**
 * Returns search keywords + display label for catalog visual search.
 */
async function analyzeImageForCatalog(imagePath) {
  const abs = path.isAbsolute(imagePath)
    ? imagePath
    : path.resolve(BACKEND_ROOT, imagePath);

  if (!fs.existsSync(abs)) {
    throw new Error(`Image not found: ${abs}`);
  }

  let keywords = new Set();
  let displayLabels = [];
  let method = "imagenet";

  try {
    const clipScores = await classifyWithClip(abs);
    if (clipScores.length > 0 && clipScores[0].score >= 0.12) {
      const { keywords: clipKw, labels } = expandClipLabels(clipScores);
      clipKw.forEach((k) => keywords.add(k));
      displayLabels = labels.length ? labels : [clipScores[0].label];
      method = "clip";
    }
  } catch (err) {
    console.warn("[catalogVision] CLIP failed, using ImageNet only:", err.message);
  }

  if (keywords.size === 0) {
    const imagenetLabel = await predictImageLabel(abs);
    const expanded = expandVisionLabel(imagenetLabel);
    expanded.forEach((k) => keywords.add(k));
    displayLabels = [imagenetLabel];
    method = "imagenet";
  } else {
    const imagenetLabel = await predictImageLabel(abs).catch(() => null);
    if (imagenetLabel) {
      expandVisionLabel(imagenetLabel).forEach((k) => keywords.add(k));
      if (!displayLabels.length) displayLabels = [imagenetLabel];
    }
  }

  const finalKeywords = [...keywords].filter((k) => k && k.length > 1);

  return {
    keywords: finalKeywords,
    predictedLabel: displayLabels.join(" · ") || "product",
    method,
  };
}

module.exports = { analyzeImageForCatalog, classifyWithClip };
