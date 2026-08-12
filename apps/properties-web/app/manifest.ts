import type { MetadataRoute } from "next";

export default function manifest():
  MetadataRoute.Manifest {
  return {
    name: "Koinonia Properties",
    short_name: "Koinonia Properties",
    description:
      "Colorado property management for rental property owners, tenants, and investors.",
    start_url: "/",
    display: "standalone"
  };
}
