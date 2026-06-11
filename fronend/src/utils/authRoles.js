export function isAdminUser(user) {
  return String(user?.role || "").toUpperCase() === "ADMIN";
}
