// Auto-generated App Router handler wrapping the original Express controller.
// The controller logic in src/server is reused unchanged via createHandler().
import { createHandler } from "@/lib/expressAdapter";
import userController from "@/server/controller/user.controller";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = createHandler(userController.getAllUsers);
