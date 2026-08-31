// Ported from backend/src/routes/adminProduct.routes.js — logic unchanged apart
// from storing gallery images as base64 data URIs (no writable disk on Vercel).
import { createHandler } from "@/lib/expressAdapter";
import authenticate from "@/server/middleware/authenticate";
import isAdmin from "@/server/middleware/isAdmin";
import Product from "@/server/models/product.model";
import mongoose from "mongoose";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function updateGalleryImages(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).send("Invalid ProductId");
  }

  const files = req.files;
  const imagesPaths = [];

  if (files) {
    files.forEach((file) => {
      imagesPaths.push(file.dataUri);
    });
  }

  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { images: imagesPaths },
    { new: true }
  );

  if (!product) {
    return res.status(500).send("The product cannot be updated!");
  }

  return res.send(product);
}

export const PUT = createHandler(authenticate, isAdmin, updateGalleryImages);
