// Issues a password reset link.
//
// Always answers the same way whether or not the address is registered, so
// this cannot be used to discover which emails have accounts. Failures to
// actually send are logged server-side rather than surfaced, for the same
// reason.
import { connectDb } from "@/lib/db";
import passwordReset from "@/server/services/passwordReset.service";
import mailer from "@/server/services/mailer.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Sending mail is a side effect on someone else's inbox, so the endpoint is
// throttled per address. In-memory is adequate for a single server; a
// multi-instance deployment would want this in Mongo or Redis.
const WINDOW_MS = 15 * 60 * 1000;
const MAX_PER_WINDOW = 3;
const attempts = new Map();

function throttled(key) {
  const now = Date.now();
  const hits = (attempts.get(key) || []).filter((t) => now - t < WINDOW_MS);
  if (hits.length >= MAX_PER_WINDOW) {
    attempts.set(key, hits);
    return true;
  }
  hits.push(now);
  attempts.set(key, hits);

  // Opportunistic cleanup so the map cannot grow without bound.
  if (attempts.size > 500) {
    for (const [k, v] of attempts) {
      if (!v.some((t) => now - t < WINDOW_MS)) attempts.delete(k);
    }
  }
  return false;
}

const ACCEPTED = {
  message:
    "If an account exists for that email, we've sent a link to reset your password.",
};

export async function POST(request) {
  let email = "";
  try {
    ({ email } = await request.json());
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const address = String(email || "").trim().toLowerCase();
  if (!address || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(address)) {
    return Response.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  if (!mailer.isConfigured()) {
    // A real misconfiguration, not a user error — say so plainly rather than
    // claiming a mail was sent that never can be.
    return Response.json(
      { error: "Password reset is unavailable right now. Please contact support." },
      { status: 503 }
    );
  }

  if (throttled(address)) {
    return Response.json(
      { error: "Too many reset requests. Please wait a few minutes and try again." },
      { status: 429 }
    );
  }

  try {
    await connectDb();
    await passwordReset.requestReset(address);
  } catch (error) {
    // Deliberately not surfaced: a send failure for a registered address would
    // otherwise distinguish it from an unregistered one.
    console.error("Password reset request failed:", error.message);
  }

  return Response.json(ACCEPTED);
}
