// Everything else in the CMS is admin-only; mirrors the BE's @Roles("admin") guards.
const OPEN_TO_ALL = ["/articles", "/columns"];
const ADMIN_ONLY = ["/articles/review-queue", "/columns/review-queue"];

const under = (path: string, prefix: string) =>
  prefix === "/" ? path === "/" : path === prefix || path.startsWith(prefix + "/");

// Where a role lands after login, and where it is sent from a page it may not see.
export const homePath = (role: string) => (role === "admin" ? "/" : "/articles");

export function canAccess(role: string, path: string): boolean {
  if (role === "admin") return true;
  return OPEN_TO_ALL.some((p) => under(path, p)) && !ADMIN_ONLY.some((p) => under(path, p));
}
