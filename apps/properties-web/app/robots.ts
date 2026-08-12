import type { MetadataRoute } from "next";
import {
  absoluteUrl,
  siteUrl
} from "@/config/seo.config";

export default function robots():
  MetadataRoute.Robots {
  if (!siteUrl) {
    return {
      rules: {
        userAgent: "*",
        disallow: "/"
      }
    };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/"
    },
    sitemap:
      absoluteUrl("/sitemap.xml") ?? undefined
  };
}
