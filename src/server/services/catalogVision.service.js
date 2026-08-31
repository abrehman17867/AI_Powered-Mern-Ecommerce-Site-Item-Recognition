const fs = require("fs");
const path = require("path");
const Category = require("../models/category.model");
const {
  CATALOG_CLIP_LABELS,
  expandVisionLabel,
  expandClipLabels,
} = require("../data/visionLabelMap");

/**
 * Serverless visual search.
 *
 * The original implementation ran a local model (Python torch/ResNet18, with an
 * @xenova/transformers CLIP fallback). Neither can run on Vercel: torch is
 * ~800MB installed against a 250MB function limit, and the ONNX models would be
 * re-downloaded on every cold start.
 *
 * Instead we call the Hugging Face Inference API when HF_TOKEN is set. The
 * public contract of analyzeImageForCatalog() is unchanged, so
 * product.service.js keeps working as-is.
 */

const HF_TOKEN = process.env.HF_TOKEN;
const HF_CLIP_MODEL = process.env.HF_CLIP_MODEL || "openai/clip-vit-base-patch32";
const HF_CLASSIFY_MODEL = process.env.HF_CLASSIFY_MODEL || "google/mobilenet_v2_1.0_224";

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

async function hfRequest(model, body, contentType) {
  const res = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${HF_TOKEN}`,
      "Content-Type": contentType,
    },
    body,
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Hugging Face ${model} returned ${res.status}: ${detail.slice(0, 200)}`);
  }

  return res.json();
}

/** Zero-shot classification against our catalog vocabulary. */
async function classifyWithClip(imageBuffer) {
  const dbCategories = await loadCategoryNames();
  const candidateLabels = [
    ...new Set([...CATALOG_CLIP_LABELS, ...dbCategories]),
  ].slice(0, 32);

  const raw = await hfRequest(
    HF_CLIP_MODEL,
    JSON.stringify({
      inputs: imageBuffer.toString("base64"),
      parameters: { candidate_labels: candidateLabels },
    }),
    "application/json"
  );

  return (Array.isArray(raw) ? raw : [])
    .map((r) => ({ label: r.label, score: r.score }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
}

/** Plain ImageNet-style classification. */
async function classifyImagenet(imageBuffer) {
  const raw = await hfRequest(HF_CLASSIFY_MODEL, imageBuffer, "application/octet-stream");
  const top = Array.isArray(raw) ? raw[0] : raw;
  const label = top?.label;
  if (!label) {
    throw new Error("Image model returned no label");
  }
  return String(label).split(",")[0].replace(/_/g, " ").trim();
}

/**
 * Returns search keywords + display label for catalog visual search.
 * Shape is identical to the original Express implementation.
 */
async function analyzeImageForCatalog(imagePath) {
  const abs = path.isAbsolute(imagePath) ? imagePath : path.resolve(imagePath);

  if (!fs.existsSync(abs)) {
    throw new Error(`Image not found: ${abs}`);
  }

  if (!HF_TOKEN) {
    throw new Error(
      "Visual search is not configured. Set HF_TOKEN (a free Hugging Face access token) in the environment to enable image search."
    );
  }

  const imageBuffer = await fs.promises.readFile(abs);

  const keywords = new Set();
  let displayLabels = [];
  let method = "imagenet";

  try {
    const clipScores = await classifyWithClip(imageBuffer);
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
    const imagenetLabel = await classifyImagenet(imageBuffer);
    expandVisionLabel(imagenetLabel).forEach((k) => keywords.add(k));
    displayLabels = [imagenetLabel];
    method = "imagenet";
  } else {
    const imagenetLabel = await classifyImagenet(imageBuffer).catch(() => null);
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
