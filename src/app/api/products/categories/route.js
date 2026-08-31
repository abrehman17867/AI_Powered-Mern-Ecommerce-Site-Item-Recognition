// Auto-generated App Router handler wrapping the original Express controller.
// The controller logic in src/server is reused unchanged via createHandler().
import { createHandler } from "@/lib/expressAdapter";
import categoryController from "@/server/controller/category.controller";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = createHandler(categoryController.getAllCategories);
