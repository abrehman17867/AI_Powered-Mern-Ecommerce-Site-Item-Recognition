/**
 * Grants or revokes roles for a user account.
 *
 * Roles cannot be changed through the API (the switch endpoint only moves
 * between roles a user already holds), so granting ADMIN is deliberately an
 * operator action run against the database.
 *
 *   node scripts/setUserRole.js <email>                      # show current roles
 *   node scripts/setUserRole.js <email> --grant ADMIN        # add a role
 *   node scripts/setUserRole.js <email> --revoke ADMIN       # remove a role
 *   node scripts/setUserRole.js <email> --active ADMIN       # set the active role
 */
require("dotenv").config({ path: ".env.local" });
const mongoose = require("mongoose");
const User = require("../src/server/models/user.model");

const VALID = ["CUSTOMER", "ADMIN"];
const args = process.argv.slice(2);
const email = args[0];
const flag = (name) => {
  const i = args.indexOf(`--${name}`);
  return i !== -1 ? String(args[i + 1] || "").toUpperCase() : null;
};

(async () => {
  if (!email) throw new Error("Usage: node scripts/setUserRole.js <email> [--grant ROLE] [--revoke ROLE] [--active ROLE]");
  const grant = flag("grant");
  const revoke = flag("revoke");
  const active = flag("active");
  for (const [n, v] of [["grant", grant], ["revoke", revoke], ["active", active]]) {
    if (v && !VALID.includes(v)) throw new Error(`--${n} must be one of ${VALID.join(", ")}`);
  }

  await mongoose.connect(process.env.MONGODB_URL, { serverSelectionTimeoutMS: 20000 });
  // Emails contain regex metacharacters (. and +), so match exactly first and
  // fall back to a case-insensitive scan rather than building a pattern.
  let user = await User.findOne({ email });
  if (!user) {
    const all = await User.find({}, { email: 1, firstName: 1, lastName: 1, role: 1, roles: 1 });
    const wanted = email.toLowerCase();
    const hit = all.find((u) => String(u.email).toLowerCase() === wanted);
    if (hit) user = await User.findById(hit._id);
  }
  if (!user) throw new Error(`No account found for ${email}`);

  const before = { role: user.role, roles: [...(user.roles || [])] };
  let roles = [...new Set([...(user.roles || []), user.role].filter(Boolean).map((r) => String(r).toUpperCase()))]
    .filter((r) => VALID.includes(r));
  if (roles.length === 0) roles = ["CUSTOMER"];

  if (grant && !roles.includes(grant)) roles.push(grant);
  if (revoke) roles = roles.filter((r) => r !== revoke);
  if (roles.length === 0) throw new Error("A user must keep at least one role");

  let activeRole = active || user.role || "CUSTOMER";
  if (!roles.includes(activeRole)) activeRole = roles[0];

  const changed = grant || revoke || active;
  console.log(`${user.firstName || ""} ${user.lastName || ""} <${user.email}>`.trim());
  console.log(`  before: role=${before.role} roles=[${before.roles.join(", ")}]`);
  if (!changed) {
    console.log("  (no flags given — nothing changed)");
  } else {
    user.roles = roles;
    user.role = activeRole;
    await user.save();
    console.log(`  after : role=${user.role} roles=[${user.roles.join(", ")}]`);
  }
  await mongoose.disconnect();
})().catch((e) => { console.error("ERR", e.message); process.exit(1); });
