/**
 * Password reset: issuing, validating and consuming one-time reset links.
 *
 * Design notes worth keeping in mind before changing any of this:
 *
 *  - Only the SHA-256 of the token is stored. The raw token exists solely in
 *    the email, so a database leak cannot be turned into account takeover.
 *  - requestReset never reveals whether an address is registered. It returns
 *    the same value either way, so the endpoint cannot be used to enumerate
 *    which emails have accounts.
 *  - Tokens are single-use (resetPasswordUsedAt) and time-limited, and are
 *    cleared once spent.
 */
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const User = require("../models/user.model");
const mailer = require("./mailer.service");

const TOKEN_TTL_MINUTES = Number(process.env.RESET_TOKEN_TTL_MINUTES || 60);
const MIN_PASSWORD_LENGTH = 6;

const hashToken = (token) => crypto.createHash("sha256").update(String(token)).digest("hex");

function appOrigin() {
  return (process.env.NEXTAUTH_URL || "http://localhost:3000").replace(/\/$/, "");
}

function resetEmail({ firstName, link, minutes }) {
  const name = firstName ? ` ${firstName}` : "";
  const text = [
    `Hi${name},`,
    "",
    "We received a request to reset your Ecommerce password.",
    "",
    `Reset it here (the link expires in ${minutes} minutes and can only be used once):`,
    link,
    "",
    "If you did not request this, you can ignore this email — your password will not change.",
  ].join("\n");

  const html = `
  <div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#18181b">
    <p style="font-size:15px;line-height:1.6;margin:0 0 16px">Hi${name},</p>
    <p style="font-size:15px;line-height:1.6;margin:0 0 20px">
      We received a request to reset your Ecommerce password.
    </p>
    <p style="margin:0 0 24px">
      <a href="${link}"
         style="display:inline-block;background:#f97316;color:#ffffff;text-decoration:none;
                padding:12px 24px;border-radius:10px;font-weight:600;font-size:15px">
        Reset your password
      </a>
    </p>
    <p style="font-size:13px;line-height:1.6;color:#52525b;margin:0 0 8px">
      This link expires in ${minutes} minutes and can only be used once.
    </p>
    <p style="font-size:13px;line-height:1.6;color:#52525b;margin:0 0 20px">
      If you didn't request this, you can ignore this email — your password won't change.
    </p>
    <p style="font-size:12px;color:#a1a1aa;line-height:1.6;margin:0;word-break:break-all">
      If the button doesn't work, paste this into your browser:<br>${link}
    </p>
  </div>`;

  return { text, html };
}

/**
 * Issue a reset link for an address.
 *
 * Always resolves the same way, whether or not the address is registered.
 */
async function requestReset(email) {
  const address = String(email || "").trim().toLowerCase();
  if (!address) return { sent: true };

  const user = await User.findOne({ email: new RegExp(`^${address.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") });
  if (!user) return { sent: true };

  const token = crypto.randomBytes(32).toString("hex");
  user.resetPasswordTokenHash = hashToken(token);
  user.resetPasswordExpiresAt = new Date(Date.now() + TOKEN_TTL_MINUTES * 60 * 1000);
  user.resetPasswordUsedAt = undefined;
  await user.save();

  const link = `${appOrigin()}/reset-password?token=${token}&email=${encodeURIComponent(user.email)}`;
  const { text, html } = resetEmail({
    firstName: user.firstName,
    link,
    minutes: TOKEN_TTL_MINUTES,
  });

  await mailer.sendMail({
    to: user.email,
    subject: "Reset your Ecommerce password",
    text,
    html,
  });

  return { sent: true };
}

/** Look up the user a token belongs to, if it is still valid. */
async function findUserByResetToken(email, token) {
  if (!email || !token) return null;

  const user = await User.findOne({ email: String(email).trim() }).select(
    "+resetPasswordTokenHash +resetPasswordExpiresAt +resetPasswordUsedAt"
  );
  if (!user || !user.resetPasswordTokenHash) return null;

  const provided = hashToken(token);
  // Constant-time compare so a caller cannot learn the stored hash by timing.
  const a = Buffer.from(provided);
  const b = Buffer.from(user.resetPasswordTokenHash);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

  if (user.resetPasswordUsedAt) return null;
  if (!user.resetPasswordExpiresAt || user.resetPasswordExpiresAt.getTime() < Date.now()) {
    return null;
  }
  return user;
}

/** True when a link is still good — lets the page fail fast before asking for a password. */
async function verifyResetToken(email, token) {
  return Boolean(await findUserByResetToken(email, token));
}

async function resetPassword(email, token, newPassword) {
  if (!newPassword || String(newPassword).length < MIN_PASSWORD_LENGTH) {
    throw new Error(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
  }

  const user = await findUserByResetToken(email, token);
  if (!user) {
    throw new Error("This reset link is invalid or has expired. Request a new one.");
  }

  user.password = await bcrypt.hash(String(newPassword), 8);
  user.resetPasswordUsedAt = new Date();
  user.resetPasswordTokenHash = undefined;
  user.resetPasswordExpiresAt = undefined;
  await user.save();

  return true;
}

module.exports = {
  requestReset,
  verifyResetToken,
  resetPassword,
  TOKEN_TTL_MINUTES,
  MIN_PASSWORD_LENGTH,
};
