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
    url: absoluteUrl("/about")
  },
  twitter: {
    title: seoConfig.publicRoutes[2].title,
    description: seoConfig.publicRoutes[2].description
  }
};

export default function Page() {
  return <KoinoniaAbout />;
}
