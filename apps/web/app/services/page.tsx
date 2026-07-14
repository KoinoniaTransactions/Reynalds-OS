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
    url: absoluteUrl("/services")
  },
  twitter: {
    title: seoConfig.publicRoutes[1].title,
    description: seoConfig.publicRoutes[1].description
  }
};

export default function Page() {
  return <KoinoniaServices />;
}
