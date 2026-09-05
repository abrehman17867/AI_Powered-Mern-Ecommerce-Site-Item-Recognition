// Finishes the Google sign-in flow.
//
// Verifies the CSRF state, exchanges the code, resolves the profile to a local
// account, and issues the same app JWT a password login issues. The token
// travels back in the URL *fragment*, which browsers never send to a server
// and which the landing page strips immediately — a query string would end up
// in history and in any Referer header the next request sends.
import { connectDb } from "@/lib/db";
import googleOAuth from "@/server/config/googleOAuth";
import jwtProvider from "@/server/config/jwtProvider";
import userService from "@/server/services/user.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function readCookie(request, name) {
  const raw = request.headers.get("cookie") || "";
  const hit = raw
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${name}=`));
  return hit ? decodeURIComponent(hit.slice(name.length + 1)) : null;
}

/** Only same-site paths; never an absolute URL an attacker could supply. */
function safePath(value) {
  if (!value || typeof value !== "string") return "/";
  if (!value.startsWith("/") || value.startsWith("//")) return "/";
  return value;
}

function bounce(message, from = "/login") {
  const url = `${googleOAuth.appOrigin()}${from}?auth_error=${encodeURIComponent(message)}`;
  return new Response(null, {
    status: 302,
    headers: {
      Location: url,
      // Clear the one-shot cookies whichever way this ends.
      "Set-Cookie": "g_oauth_state=; Path=/; HttpOnly; Max-Age=0",
    },
  });
}

export async function GET(request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const oauthError = url.searchParams.get("error");

  if (oauthError) {
    return bounce(
      oauthError === "access_denied" ? "Google sign-in was cancelled." : "Google sign-in failed."
    );
  }

  const expectedState = readCookie(request, "g_oauth_state");
  if (!state || !expectedState || state !== expectedState) {
    return bounce("Sign-in session expired. Please try again.");
  }
  if (!code) return bounce("Google did not return an authorization code.");

  try {
    const tokens = await googleOAuth.exchangeCode(code);
    const profile = googleOAuth.decodeIdToken(tokens.id_token);

    await connectDb();
    const user = await userService.findOrCreateGoogleUser(profile);
    const jwt = jwtProvider.generateToken(user._id);

    const from = safePath(readCookie(request, "g_oauth_from"));
    const target = `${googleOAuth.appOrigin()}/auth/google/complete#token=${encodeURIComponent(
      jwt
    )}&from=${encodeURIComponent(from)}`;

    const headers = new Headers({ Location: target });
    headers.append("Set-Cookie", "g_oauth_state=; Path=/; HttpOnly; Max-Age=0");
    headers.append("Set-Cookie", "g_oauth_from=; Path=/; HttpOnly; Max-Age=0");
    return new Response(null, { status: 302, headers });
  } catch (error) {
    return bounce(error.message || "Could not complete Google sign-in.");
  }
}
