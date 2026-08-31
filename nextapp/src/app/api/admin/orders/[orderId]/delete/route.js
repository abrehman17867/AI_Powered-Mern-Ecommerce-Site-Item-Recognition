// Auto-generated App Router handler wrapping the original Express controller.
// The controller logic in src/server is reused unchanged via createHandler().
import { createHandler } from "@/lib/expressAdapter";
import adminOrderController from "@/server/controller/adminOrder.controller";
import authenticate from "@/server/middleware/authenticate";
import isAdmin from "@/server/middleware/isAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const PUT = createHandler(authenticate, isAdmin, adminOrderController.deleteOrders);
