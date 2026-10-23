const publicMarketingRoutes = new Set([
  "/",
  "/about",
  "/contact",
  "/privacy",
  "/referrals",
  "/services"
]);

export function isPublicMarketingRoute(pathname: string | null | undefined) {
  if (!pathname) return false;

  const normalized =
    pathname === "/" ? pathname : pathname.replace(/\/+$/, "");

  return publicMarketingRoutes.has(normalized);
}
