import { NextResponse } from "next/server";
import fs from "fs";
import os from "os";
import path from "path";
import { connectDb } from "./db";

/**
 * Runs the existing Express controllers/middleware unchanged inside Next.js
 * App Router route handlers.
 *
 * The controllers in src/server were written against Express `(req, res, next)`.
 * Rather than rewrite that logic, this adapter synthesises compatible `req` and
 * `res` objects around the Web `Request`, so the API behaviour stays identical.
 */

const TMP_DIR = os.tmpdir();

function parseCookies(header) {
  const out = {};
  if (!header) return out;
  for (const part of header.split(";")) {
    const idx = part.indexOf("=");
    if (idx === -1) continue;
    out[part.slice(0, idx).trim()] = decodeURIComponent(part.slice(idx + 1).trim());
  }
  return out;
}

/**
 * Mimics a multer file object. `path` points at a real file in the OS temp dir
 * (writable on Vercel) so services that read the upload off disk keep working.
 * `dataUri` carries the base64 payload for storing the image in MongoDB.
 */
async function toMulterFile(fieldname, file) {
  const buffer = Buffer.from(await file.arrayBuffer());
  const originalname = file.name || "upload";
  const ext = path.extname(originalname) || ".jpg";
  const filename = `${path.basename(originalname, ext).split(" ").join("-")}-${Date.now()}${ext}`;
  const filepath = path.join(TMP_DIR, filename);

  await fs.promises.writeFile(filepath, buffer);

  return {
    fieldname,
    originalname,
    encoding: "7bit",
    mimetype: file.type || "application/octet-stream",
    size: buffer.length,
    destination: TMP_DIR,
    filename,
    path: filepath,
    buffer,
    dataUri: `data:${file.type || "image/jpeg"};base64,${buffer.toString("base64")}`,
  };
}

async function buildRequest(request, params) {
  const url = new URL(request.url);
  const headers = Object.fromEntries(request.headers.entries());
  const contentType = headers["content-type"] || "";

  let body = {};
  let file;
  let files;

  if (!["GET", "HEAD"].includes(request.method)) {
    if (contentType.includes("application/json")) {
      body = await request.json().catch(() => ({}));
    } else if (contentType.includes("multipart/form-data")) {
      const form = await request.formData();
      body = {};
      const collected = [];
      for (const [key, value] of form.entries()) {
        if (typeof value === "object" && typeof value.arrayBuffer === "function") {
          collected.push(await toMulterFile(key, value));
        } else {
          body[key] = value;
        }
      }
      if (collected.length === 1) {
        [file] = collected;
      }
      if (collected.length > 0) {
        files = collected;
      }
    } else if (contentType.includes("application/x-www-form-urlencoded")) {
      const text = await request.text();
      body = Object.fromEntries(new URLSearchParams(text));
    } else {
      const text = await request.text().catch(() => "");
      try {
        body = text ? JSON.parse(text) : {};
      } catch {
        body = {};
      }
    }
  }

  return {
    method: request.method,
    url: url.pathname + url.search,
    originalUrl: url.pathname + url.search,
    baseUrl: "",
    path: url.pathname,
    params: params || {},
    query: Object.fromEntries(url.searchParams.entries()),
    body,
    file,
    files,
    headers,
    cookies: parseCookies(headers.cookie),
    protocol: url.protocol.replace(":", ""),
    hostname: url.hostname,
    get(name) {
      return this.headers[String(name).toLowerCase()];
    },
    header(name) {
      return this.get(name);
    },
  };
}

function buildResponse() {
  const state = { statusCode: 200, headers: {}, settled: false };
  let resolveResponse;
  const finished = new Promise((resolve) => {
    resolveResponse = resolve;
  });

  function finalize(payload, { json = false } = {}) {
    if (state.settled) return;
    state.settled = true;

    if (payload === undefined || payload === null) {
      resolveResponse(new NextResponse(null, { status: state.statusCode, headers: state.headers }));
      return;
    }

    if (json || typeof payload === "object") {
      resolveResponse(
        NextResponse.json(payload, { status: state.statusCode, headers: state.headers })
      );
      return;
    }

    resolveResponse(
      new NextResponse(String(payload), {
        status: state.statusCode,
        headers: { "content-type": "text/plain; charset=utf-8", ...state.headers },
      })
    );
  }

  const res = {
    statusCode: 200,
    get __settled() {
      return state.settled;
    },
    status(code) {
      state.statusCode = code;
      this.statusCode = code;
      return this;
    },
    set(name, value) {
      state.headers[name] = value;
      return this;
    },
    setHeader(name, value) {
      return this.set(name, value);
    },
    send(payload) {
      finalize(payload);
      return this;
    },
    json(payload) {
      finalize(payload, { json: true });
      return this;
    },
    end(payload) {
      finalize(payload);
      return this;
    },
  };

  return { res, finished };
}

/**
 * Compose Express-style handlers (middleware + controller) into a Next route handler.
 *
 * Usage:
 *   export const POST = createHandler(authenticate, isAdmin, productController.createProduct);
 */
export function createHandler(...handlers) {
  return async function handler(request, context) {
    const params = (await context?.params) || {};
    const { res, finished } = buildResponse();

    try {
      await connectDb();
      const req = await buildRequest(request, params);

      // Express middleware calls next() without awaiting it, so we capture the
      // downstream promise and await it here — otherwise a rejection further
      // down the chain would escape this try/catch as an unhandled rejection.
      const run = async (index) => {
        if (index >= handlers.length) return;
        const current = handlers[index];
        let downstream = null;
        const next = (err) => {
          if (err) {
            downstream = Promise.reject(err);
            return downstream;
          }
          downstream = run(index + 1);
          return downstream;
        };

        await current(req, res, next);
        if (downstream) {
          await downstream;
        }
      };

      await run(0);

      if (!res.__settled) {
        res.status(500).send({ error: "Handler produced no response" });
      }
    } catch (error) {
      if (!res.statusCode || res.statusCode === 200) {
        res.status(500);
      }
      res.send({ error: error?.message || "Internal Server Error" });
    }

    return finished;
  };
}

export { buildRequest, buildResponse };
