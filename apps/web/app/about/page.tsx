import type { Metadata } from "next";
import { KoinoniaAbout } from "../../components/site/PageAssemblies/KoinoniaAbout";
import { absoluteUrl, seoConfig } from "../../config/seo.config";

export const metadata: Metadata = {
  title: seoConfig.publicRoutes[2].title,
  description: seoConfig.publicRoutes[2].description,
  alternates: {
    canonical: absoluteUrl("/about")
  },
  openGraph: {
    title: seoConfig.publicRoutes[2].title,
    description: seoConfig.publicRoutes[2].description,
    images: [
      {
        url: absoluteUrl(seoConfig.socialPreviewPath),
        width: seoConfig.socialPreviewWidth,
        height: seoConfig.socialPreviewHeight,
        alt: seoConfig.publicRoutes[2].title
      }
    ],
    url: absoluteUrl("/about")
  },
  twitter: {
    title: seoConfig.publicRoutes[2].title,
    description: seoConfig.publicRoutes[2].description,
    images: [absoluteUrl(seoConfig.socialPreviewPath)]
  }
};

export default function Page() {
  return <KoinoniaAbout />;
}
