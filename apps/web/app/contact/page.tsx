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
    url: absoluteUrl("/contact")
  },
  twitter: {
    title: seoConfig.publicRoutes[3].title,
    description: seoConfig.publicRoutes[3].description
  }
};

export default function Page() {
  return <KoinoniaContact />;
}
