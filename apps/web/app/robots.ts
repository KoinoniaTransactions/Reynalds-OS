import type { MetadataRoute } from "next";
import { absoluteUrl } from "../config/seo.config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/services", "/about", "/contact"],
        disallow: ["/dashboard", "/api", "/copilot", "/crm", "/employee", "/finance", "/knowledge", "/notifications", "/objects", "/operations", "/transactions", "/workflows"]
      }
    ],
    sitemap: absoluteUrl("/sitemap.xml")
  };
}
