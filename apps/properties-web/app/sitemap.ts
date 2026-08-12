import type { MetadataRoute } from "next";
import {
  absoluteUrl,
  seoConfig
} from "@/config/seo.config";

export default function sitemap():
  MetadataRoute.Sitemap {
  return seoConfig.publicRoutes.flatMap(
    (route) => {
      const url = absoluteUrl(route.path);

      return url ? [{ url }] : [];
    }
  );
}
