// Auto-generated App Router handler wrapping the original Express controller.
// The controller logic in src/server is reused unchanged via createHandler().
import { createHandler } from "@/lib/expressAdapter";
import reviewController from "@/server/controller/review.controller";
import authenticate from "@/server/middleware/authenticate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST = createHandler(authenticate, reviewController.createReview);
