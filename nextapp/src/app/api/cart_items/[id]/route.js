// Auto-generated App Router handler wrapping the original Express controller.
// The controller logic in src/server is reused unchanged via createHandler().
import { createHandler } from "@/lib/expressAdapter";
import cartItemController from "@/server/controller/cartItem.controller";
import authenticate from "@/server/middleware/authenticate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const PUT = createHandler(authenticate, cartItemController.updateCartItem);
export const DELETE = createHandler(authenticate, cartItemController.removeCartItem);
