import type { MetadataRoute } from "next";
import { absoluteUrl, seoConfig } from "../config/seo.config";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return seoConfig.publicRoutes.map((route) => ({
    url: absoluteUrl(route.path),
    lastModified: now,
    changeFrequency: route.path === "/" ? "weekly" : "monthly",
    priority: route.path === "/" ? 1 : 0.8
  }));
}
