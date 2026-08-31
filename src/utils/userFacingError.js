const TECHNICAL_PATTERNS =
  /request failed with status code|network error|failed to fetch|mongodb|mongoose|e11000|bcrypt|jwt|stack trace|internal server/i;

function statusFallback(status, context) {
  if (status === 401 || status === 404) {
    if (context === "login") {
      return "The email or password you entered is incorrect. Please try again.";
    }
    if (context === "register") {
      return "We couldn't create your account with those details. Please check and try again.";
    }
    return "We couldn't verify your account. Please check your details and try again.";
  }
  if (status === 403) {
    return "You don't have permission to complete this action.";
  }
  if (status === 409) {
    return "An account with this email already exists. Try signing in instead.";
  }
  if (status >= 500) {
    return "Something went wrong on our end. Please try again in a few minutes.";
  }
  if (status === 0 || status == null) {
    return "We couldn't reach the server. Check your internet connection and try again.";
  }
  return "Something went wrong. Please try again.";
}

function mapKnownMessage(raw, context) {
  const msg = String(raw || "").trim();
  if (!msg) return "";

  if (/network error|failed to fetch|network request failed/i.test(msg)) {
    return "We couldn't reach the server. Check your internet connection and try again.";
  }

  if (/request failed with status code/i.test(msg)) {
    return "";
  }

  if (/invalid password/i.test(msg)) {
    return "The email or password you entered is incorrect. Please try again.";
  }

  if (/user not found/i.test(msg)) {
    return "No account found with that email. Check the spelling or create a new account.";
  }

  if (/email.*already|already exists|duplicate key/i.test(msg)) {
    return "An account with this email already exists. Try signing in instead.";
  }

  if (TECHNICAL_PATTERNS.test(msg)) {
    if (context === "login") {
      return "We couldn't sign you in right now. Please try again in a few minutes.";
    }
    if (context === "register") {
      return "We couldn't create your account right now. Please try again in a few minutes.";
    }
    return "Something went wrong. Please try again in a few minutes.";
  }

  if (msg.length <= 140 && !msg.includes("status code")) {
    return msg.replace(/\.\.\.$/, ".");
  }

  return "";
}

/**
 * Turn API / axios errors into short copy for shoppers (not developers).
 * @param {unknown} error - axios error, string from redux, or Error
 * @param {"login"|"register"|"default"} [context]
 */
export function getUserFacingError(error, context = "default") {
  if (error == null) return statusFallback(null, context);

  if (typeof error === "string") {
    const mapped = mapKnownMessage(error, context);
    return mapped || statusFallback(null, context);
  }

  const status = error?.response?.status;
  const data = error?.response?.data;
  const raw = data?.message || data?.error || error?.message || "";

  const mapped = mapKnownMessage(raw, context);
  if (mapped) return mapped;

  if (TECHNICAL_PATTERNS.test(String(raw))) {
    return statusFallback(status, context);
  }

  return statusFallback(status, context);
}
