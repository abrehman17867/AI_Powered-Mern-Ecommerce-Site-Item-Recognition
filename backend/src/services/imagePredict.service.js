const path = require("path");
const fs = require("fs");
const { spawn } = require("child_process");

const BACKEND_ROOT = path.join(__dirname, "../..");
const PREDICT_SCRIPT = path.join(BACKEND_ROOT, "predict.py");

let nodePipeline = null;

function resolveImagePath(imagePath) {
  const abs = path.isAbsolute(imagePath)
    ? imagePath
    : path.resolve(BACKEND_ROOT, imagePath);
  if (!fs.existsSync(abs)) {
    throw new Error(`Image file not found: ${abs}`);
  }
  return abs;
}

function runPythonPredict(absImagePath) {
  const pythonCmd = process.env.PYTHON_PATH || "python";

  return new Promise((resolve, reject) => {
    const proc = spawn(pythonCmd, [PREDICT_SCRIPT, absImagePath], {
      cwd: BACKEND_ROOT,
      windowsHide: true,
    });

    let stdout = "";
    let stderr = "";

    proc.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });

    proc.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    proc.on("error", (err) => {
      reject(
        new Error(
          `Could not start Python (${pythonCmd}). Install Python 3.10+ and run: pip install -r requirements.txt. ${err.message}`
        )
      );
    });

    proc.on("close", (code) => {
      const out = stdout.trim();
      if (code === 0 && out) {
        resolve(out);
        return;
      }
      const detail = (stderr || stdout || `exit code ${code}`).trim();
      reject(new Error(detail || "Python image model returned no label"));
    });
  });
}

async function runNodePredict(absImagePath) {
  const { pipeline } = await import("@xenova/transformers");
  if (!nodePipeline) {
    nodePipeline = await pipeline(
      "image-classification",
      "Xenova/mobilenet-1.0"
    );
  }
  const results = await nodePipeline(absImagePath, { topk: 1 });
  const top = Array.isArray(results) ? results[0] : results;
  const label = top?.label || top?.class_name;
  if (!label) {
    throw new Error("Node image model returned no label");
  }
  return label.replace(/_/g, " ").trim();
}

/**
 * Predict ImageNet-style label for an uploaded image.
 * Tries Python (torch) first unless IMAGE_PREDICT_MODE=node, then @xenova/transformers.
 */
async function predictImageLabel(imagePath) {
  const absImagePath = resolveImagePath(imagePath);
  const mode = (process.env.IMAGE_PREDICT_MODE || "auto").toLowerCase();

  if (mode === "node") {
    return runNodePredict(absImagePath);
  }

  if (mode !== "python") {
    try {
      return await runPythonPredict(absImagePath);
    } catch (pythonErr) {
      console.warn(
        "[imagePredict] Python failed, using Node fallback:",
        pythonErr.message
      );
      try {
        return await runNodePredict(absImagePath);
      } catch (nodeErr) {
        throw new Error(
          `Visual search model unavailable. Python: ${pythonErr.message}. Node: ${nodeErr.message}`
        );
      }
    }
  }

  return runPythonPredict(absImagePath);
}

module.exports = { predictImageLabel, BACKEND_ROOT };
