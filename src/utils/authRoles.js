const VALID_ROLES = ["CUSTOMER", "ADMIN"];

export const ROLE_LABELS = {
  CUSTOMER: "Customer",
  ADMIN: "Administrator",
};

/**
 * Every role the user holds. Accounts created before multi-role support have no
 * `roles` array, so fall back to the single active role.
 */
export function getUserRoles(user) {
  const active = String(user?.role || "").toUpperCase();
  const list = Array.isArray(user?.roles) ? user.roles : [];
  const roles = [...new Set([...list, active].map((r) => String(r).toUpperCase()))].filter((r) =>
    VALID_ROLES.includes(r)
  );
  return roles.length > 0 ? roles : [];
}

/** The role currently in effect — what authorisation is actually checked against. */
export function getActiveRole(user) {
  const active = String(user?.role || "").toUpperCase();
  return VALID_ROLES.includes(active) ? active : "";
}

/** True when the user is *acting* as an admin right now. */
export function isAdminUser(user) {
  return getActiveRole(user) === "ADMIN";
}

/** True when the user is entitled to admin, whether or not it is their active role. */
export function hasAdminRole(user) {
  return getUserRoles(user).includes("ADMIN");
}

/** True when the account holds more than one role, so a switcher is worth showing. */
export function hasMultipleRoles(user) {
  return getUserRoles(user).length > 1;
}
