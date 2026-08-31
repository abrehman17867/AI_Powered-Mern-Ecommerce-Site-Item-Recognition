// Auto-generated App Router handler wrapping the original Express controller.
// The controller logic in src/server is reused unchanged via createHandler().
import { createHandler } from "@/lib/expressAdapter";
import authController from "@/server/controller/auth.controller";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST = createHandler(authController.register);
