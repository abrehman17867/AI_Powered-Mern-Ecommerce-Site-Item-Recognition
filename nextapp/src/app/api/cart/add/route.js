// Auto-generated App Router handler wrapping the original Express controller.
// The controller logic in src/server is reused unchanged via createHandler().
import { createHandler } from "@/lib/expressAdapter";
import cartController from "@/server/controller/cart.controller";
import authenticate from "@/server/middleware/authenticate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const PUT = createHandler(authenticate, cartController.addItemToCart);
