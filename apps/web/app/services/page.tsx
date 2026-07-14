import type { Metadata } from "next";
import { KoinoniaServices } from "../../components/site/PageAssemblies/KoinoniaServices";
import { absoluteUrl, seoConfig } from "../../config/seo.config";

export const metadata: Metadata = {
  title: seoConfig.publicRoutes[1].title,
  description: seoConfig.publicRoutes[1].description,
  alternates: {
    canonical: absoluteUrl("/services")
  },
  openGraph: {
    title: seoConfig.publicRoutes[1].title,
    description: seoConfig.publicRoutes[1].description,
    images: [
      {
        url: absoluteUrl(seoConfig.socialPreviewPath),
        width: seoConfig.socialPreviewWidth,
        height: seoConfig.socialPreviewHeight,
        alt: seoConfig.publicRoutes[1].title
      }
    ],
    url: absoluteUrl("/services")
  },
  twitter: {
    title: seoConfig.publicRoutes[1].title,
    description: seoConfig.publicRoutes[1].description,
    images: [absoluteUrl(seoConfig.socialPreviewPath)]
  }
};

export default function Page() {
  return <KoinoniaServices />;
}
