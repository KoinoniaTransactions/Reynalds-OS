import type { MetadataRoute } from "next";
import { seoConfig } from "../config/seo.config";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: seoConfig.businessName,
    short_name: seoConfig.siteName,
    description: seoConfig.defaultDescription,
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#f8f4eb",
    theme_color: "#111111",
    icons: [
      {
        src: "/icon.svg",
        sizes: "512x512",
        type: "image/svg+xml",
        purpose: "any"
      },
      {
        src: "/apple-icon.svg",
        sizes: "512x512",
        type: "image/svg+xml",
        purpose: "any"
      }
    ],
    categories: ["business", "productivity"]
  };
}
