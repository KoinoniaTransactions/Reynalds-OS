import type {
  MetadataRoute
} from "next";

export default function manifest():
  MetadataRoute.Manifest {
  return {
    name:
      "J&M Reynalds Finances",
    short_name:
      "J&M Finances",
    description:
      "Our money, clearly organized.",
    start_url:
      "/personal",
    scope:
      "/personal",
    display:
      "standalone",
    background_color:
      "#F5F9FC",
    theme_color:
      "#2678D4",
    icons: [
      {
        src:
          "/personal/icon.svg",
        sizes:
          "any",
        type:
          "image/svg+xml"
      },
      {
        src:
          "/personal/apple-icon.svg",
        sizes:
          "180x180",
        type:
          "image/svg+xml"
      }
    ]
  };
}
