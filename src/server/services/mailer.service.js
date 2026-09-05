/**
 * Outbound email over SMTP.
 *
 * Configured for Gmail with an App Password — a normal account password will
 * not work, Google rejects it for SMTP. Set in .env.local:
 *
 *   SMTP_USER=you@gmail.com
 *   SMTP_PASSWORD=<16-character app password>
 *   MAIL_FROM="Ecommerce <you@gmail.com>"      # optional, defaults to SMTP_USER
 *
 * Other providers work by overriding SMTP_HOST / SMTP_PORT.
 */
const nodemailer = require("nodemailer");

let cachedTransport = null;

/**
 * Read an env value defensively.
 *
 * Values pasted from documentation routinely arrive with trailing spaces or
 * wrapping quotes still attached; an untrimmed SMTP_HOST is not a resolvable
 * hostname, and the resulting DNS error says nothing about the real cause.
 */
function env(name, fallback = "") {
  const raw = process.env[name];
  if (raw === undefined || raw === null) return fallback;
  const trimmed = String(raw).trim().replace(/^["']|["']$/g, "").trim();
  return trimmed || fallback;
}

function isConfigured() {
  return Boolean(env("SMTP_USER") && env("SMTP_PASSWORD"));
}

function transport() {
  if (cachedTransport) return cachedTransport;
  if (!isConfigured()) {
    throw new Error("Email is not configured (SMTP_USER / SMTP_PASSWORD missing)");
  }

  const port = Number(env("SMTP_PORT", "465"));

  cachedTransport = nodemailer.createTransport({
    host: env("SMTP_HOST", "smtp.gmail.com"),
    port,
    // 465 is implicit TLS; 587 upgrades with STARTTLS.
    secure: port === 465,
    auth: {
      user: env("SMTP_USER"),
      // Gmail app passwords are often shown in groups of four; the spaces are
      // presentational and Google rejects them if sent literally.
      pass: env("SMTP_PASSWORD").replace(/\s+/g, ""),
    },
  });

  return cachedTransport;
}

function from() {
  return env("MAIL_FROM") || `Ecommerce <${env("SMTP_USER")}>`;
}

async function sendMail({ to, subject, text, html }) {
  const info = await transport().sendMail({ from: from(), to, subject, text, html });
  return info;
}

/** Confirms the credentials and connection without sending anything. */
async function verifyConnection() {
  return transport().verify();
}

module.exports = { isConfigured, sendMail, verifyConnection };
