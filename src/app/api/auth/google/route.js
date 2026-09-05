// Starts the Google sign-in flow.
//
// Generates a CSRF `state`, parks it in a short-lived httpOnly cookie, and
// sends the browser to Google's consent screen. The callback refuses any
// response whose state does not match the cookie.
import crypto from "crypto";
import googleOAuth from "@/server/config/googleOAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request) {
  if (!googleOAuth.isConfigured()) {
    return Response.json(
      { error: "Google sign-in is not configured on this server." },
      { status: 503 }
    );
  }

  const state = crypto.randomBytes(16).toString("hex");

  // Remember where to send the shopper back to once signed in.
  const from = new URL(request.url).searchParams.get("from") || "/";

  const res = Response.redirect(googleOAuth.buildAuthUrl(state), 302);
  const headers = new Headers(res.headers);
  const secure = googleOAuth.appOrigin().startsWith("https://") ? "; Secure" : "";
  headers.append(
    "Set-Cookie",
    `g_oauth_state=${state}; Path=/; HttpOnly; SameSite=Lax; Max-Age=600${secure}`
  );
  headers.append(
    "Set-Cookie",
    // Only ever a path within this app — the callback rejects anything else.
    `g_oauth_from=${encodeURIComponent(from)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=600${secure}`
  );
  return new Response(null, { status: 302, headers });
}
