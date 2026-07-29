import type { MetadataRoute } from "next";
import { absoluteUrl } from "../config/seo.config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/services", "/about", "/contact"],
        disallow: ["/dashboard", "/api", "/client/billing", "/client/dashboard", "/client/documents", "/copilot", "/crm", "/employee", "/employee/launch", "/employee/readiness", "/employee/review", "/finance", "/knowledge", "/notifications", "/objects", "/operations", "/reynalds-brothers", "/transactions", "/workflows"]
      }
    ],
    sitemap: absoluteUrl("/sitemap.xml")
  };
}
