import type { Metadata } from "next";
import { KoinoniaContact } from "../../components/site/PageAssemblies/KoinoniaContact";
import { absoluteUrl, seoConfig } from "../../config/seo.config";

export const metadata: Metadata = {
  title: seoConfig.publicRoutes[3].title,
  description: seoConfig.publicRoutes[3].description,
  alternates: {
    canonical: absoluteUrl("/contact")
  },
  openGraph: {
    title: seoConfig.publicRoutes[3].title,
    description: seoConfig.publicRoutes[3].description,
    images: [
      {
        url: absoluteUrl(seoConfig.socialPreviewPath),
        width: seoConfig.socialPreviewWidth,
        height: seoConfig.socialPreviewHeight,
        alt: seoConfig.publicRoutes[3].title
      }
    ],
    url: absoluteUrl("/contact")
  },
  twitter: {
    title: seoConfig.publicRoutes[3].title,
    description: seoConfig.publicRoutes[3].description,
    images: [absoluteUrl(seoConfig.socialPreviewPath)]
  }
};

export default function Page() {
  return <KoinoniaContact />;
}
