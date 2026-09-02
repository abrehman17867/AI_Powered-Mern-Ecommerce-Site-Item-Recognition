// Switches which of the signed-in user's roles is active.
// The service refuses roles the user does not already hold, so this cannot be
// used to self-promote.
import { createHandler } from "@/lib/expressAdapter";
import userController from "@/server/controller/user.controller";
import authenticate from "@/server/middleware/authenticate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const PUT = createHandler(authenticate, userController.switchRole);
