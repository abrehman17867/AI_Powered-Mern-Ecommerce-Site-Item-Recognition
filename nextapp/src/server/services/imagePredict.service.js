const path = require("path");
const fs = require("fs");
const os = require("os");

/**
 * Serverless replacement for the original Python/torch + @xenova pipeline.
 * Delegates to the Hugging Face-backed classifier in catalogVision.service.
 */
const BACKEND_ROOT = os.tmpdir();

function resolveImagePath(imagePath) {
  const abs = path.isAbsolute(imagePath) ? imagePath : path.resolve(imagePath);
  if (!fs.existsSync(abs)) {
    throw new Error(`Image file not found: ${abs}`);
  }
  return abs;
}

async function predictImageLabel(imagePath) {
  const abs = resolveImagePath(imagePath);
  const { analyzeImageForCatalog } = require("./catalogVision.service");
  const { predictedLabel } = await analyzeImageForCatalog(abs);
  return predictedLabel;
}

module.exports = { predictImageLabel, BACKEND_ROOT };
