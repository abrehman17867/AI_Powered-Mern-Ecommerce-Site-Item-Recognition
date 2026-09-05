/**
 * Google OAuth 2.0 — authorization code flow, implemented directly.
 *
 * The app already has its own auth: a JWT in localStorage, an `authenticate`
 * middleware reading the Bearer header, and a Redux auth slice. next-auth
 * would run a parallel cookie session that none of that understands, so this
 * does the code exchange itself and finishes by issuing the *same* app JWT a
 * password login issues. Google becomes another way to obtain that token
 * rather than a second auth system.
 */
const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";

/** Where Google sends the browser back. Must match the Console entry exactly. */
function redirectUri() {
  const base = (process.env.NEXTAUTH_URL || "http://localhost:3000").replace(/\/$/, "");
  return `${base}/api/auth/google/callback`;
}

/** Where the browser lands once we have issued a token. */
function appOrigin() {
  return (process.env.NEXTAUTH_URL || "http://localhost:3000").replace(/\/$/, "");
}

function isConfigured() {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

function buildAuthUrl(state) {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: redirectUri(),
    response_type: "code",
    scope: "openid email profile",
    state,
    // Always show the chooser: without this a shopper with several Google
    // accounts is silently signed in as whichever one the browser prefers.
    prompt: "select_account",
  });
  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
}

/**
 * Swap the one-time code for tokens.
 *
 * This is a direct server-to-server call authenticated with the client secret,
 * so the id_token in the response comes from Google over TLS and does not need
 * a separate signature check before we read its claims.
 */
async function exchangeCode(code) {
  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: redirectUri(),
      grant_type: "authorization_code",
    }),
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Google token exchange failed (${res.status}): ${detail.slice(0, 200)}`);
  }
  return res.json();
}

/** Decode the id_token payload. Safe here only because of exchangeCode above. */
function decodeIdToken(idToken) {
  const parts = String(idToken || "").split(".");
  if (parts.length !== 3) throw new Error("Malformed id_token from Google");
  const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8"));

  if (!payload.email) throw new Error("Google account has no email address");
  if (payload.email_verified === false) {
    throw new Error("That Google email address is not verified");
  }
  return {
    googleId: payload.sub,
    email: payload.email,
    firstName: payload.given_name || payload.name || "Shopper",
    lastName: payload.family_name || "",
    avatar: payload.picture || "",
  };
}

module.exports = {
  isConfigured,
  redirectUri,
  appOrigin,
  buildAuthUrl,
  exchangeCode,
  decodeIdToken,
};
