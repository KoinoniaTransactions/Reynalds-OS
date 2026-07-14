import type { Metadata } from "next";
import { KoinoniaHome } from "../components/site/PageAssemblies/KoinoniaHome";
import { absoluteUrl, seoConfig } from "../config/seo.config";

export const metadata: Metadata = {
  title: seoConfig.publicRoutes[0].title,
  description: seoConfig.publicRoutes[0].description,
  alternates: {
    canonical: absoluteUrl("/")
  },
  openGraph: {
    title: seoConfig.publicRoutes[0].title,
    description: seoConfig.publicRoutes[0].description,
    images: [
      {
        url: absoluteUrl(seoConfig.socialPreviewPath),
        width: seoConfig.socialPreviewWidth,
        height: seoConfig.socialPreviewHeight,
        alt: seoConfig.publicRoutes[0].title
      }
    ],
    url: absoluteUrl("/")
  },
  twitter: {
    title: seoConfig.publicRoutes[0].title,
    description: seoConfig.publicRoutes[0].description,
    images: [absoluteUrl(seoConfig.socialPreviewPath)]
  }
};

export default function Page() {
  return <KoinoniaHome />;
}
