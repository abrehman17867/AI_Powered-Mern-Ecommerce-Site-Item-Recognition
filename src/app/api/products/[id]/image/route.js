// Serves a product image stored in MongoDB as a base64 data URI.
//
// List endpoints return a reference to this route instead of inlining the
// base64 payload, so a catalog page ships kilobytes of JSON instead of
// megabytes, and browsers cache the images independently of the JSON.
//
//   GET /api/products/:id/image        -> the main product image
//   GET /api/products/:id/image?i=0    -> gallery image at that index
import crypto from "crypto";
import mongoose from "mongoose";
import { connectDb } from "@/lib/db";
import Product from "@/server/models/product.model";

export const runtime = "nodejs";

const DATA_URI = /^data:([^;,]+)?(?:;base64)?,(.*)$/s;

export async function GET(request, context) {
  const { id } = (await context.params) || {};

  if (!mongoose.isValidObjectId(id)) {
    return new Response("Invalid product id", { status: 400 });
  }

  await connectDb();

  const product = await Product.findById(id).select("imageUrl images").lean();
  if (!product) {
    return new Response("Product not found", { status: 404 });
  }

  const indexParam = new URL(request.url).searchParams.get("i");
  const source =
    indexParam === null
      ? product.imageUrl
      : Array.isArray(product.images)
        ? product.images[Number(indexParam)]
        : undefined;

  if (!source) {
    return new Response("Image not found", { status: 404 });
  }

  // Documents may still hold a plain http(s) URL rather than an embedded image.
  if (/^https?:\/\//.test(source)) {
    return Response.redirect(source, 307);
  }

  const match = DATA_URI.exec(source);
  if (!match) {
    return new Response("Unsupported image encoding", { status: 415 });
  }

  const [, mime = "image/jpeg", base64] = match;
  const body = Buffer.from(base64, "base64");
  const etag = `"${crypto.createHash("sha1").update(base64).digest("hex")}"`;

  // The URL is stable per product but its content can change when an admin
  // edits the product, so revalidate with an ETag rather than caching forever.
  if (request.headers.get("if-none-match") === etag) {
    return new Response(null, { status: 304, headers: { ETag: etag } });
  }

  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": mime,
      "Content-Length": String(body.length),
      ETag: etag,
      "Cache-Control": "public, max-age=60, stale-while-revalidate=86400",
    },
  });
}
