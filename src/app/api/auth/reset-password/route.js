// Validates a reset link (GET) and consumes it to set a new password (POST).
import { connectDb } from "@/lib/db";
import passwordReset from "@/server/services/passwordReset.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Lets the reset page fail fast on a dead link, before asking for a password. */
export async function GET(request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");
  const email = url.searchParams.get("email");

  try {
    await connectDb();
    const valid = await passwordReset.verifyResetToken(email, token);
    return Response.json({ valid });
  } catch {
    return Response.json({ valid: false });
  }
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { token, email, password } = body || {};
  if (!token || !email || !password) {
    return Response.json(
      { error: "Missing reset token, email or password." },
      { status: 400 }
    );
  }

  try {
    await connectDb();
    await passwordReset.resetPassword(email, token, password);
    return Response.json({
      ok: true,
      message: "Your password has been reset. You can sign in with it now.",
    });
  } catch (error) {
    // These messages are safe to show: they describe the link the caller
    // already holds, not whether any account exists.
    return Response.json({ error: error.message }, { status: 400 });
  }
}
