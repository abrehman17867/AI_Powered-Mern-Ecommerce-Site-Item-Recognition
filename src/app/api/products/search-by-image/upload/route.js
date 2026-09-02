// Auto-generated App Router handler wrapping the original Express controller.
// The controller logic in src/server is reused unchanged via createHandler().
import { createHandler } from "@/lib/expressAdapter";
import productController from "@/server/controller/product.controller";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Hugging Face cold-starts the model on the first request of an idle period,
// which measured ~15s locally — well over Vercel's 10s default.
export const maxDuration = 60;

export const POST = createHandler(productController.searchProductsByImage);
