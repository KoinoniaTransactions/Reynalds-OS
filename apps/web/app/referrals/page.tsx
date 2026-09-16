import type { Metadata } from "next";
import { KoinoniaReferrals } from "../../components/site/PageAssemblies/KoinoniaReferrals";
import { absoluteUrl, seoConfig } from "../../config/seo.config";

const referralRoute = seoConfig.publicRoutes.find((route) => route.path === "/referrals")!;

export const metadata: Metadata = {
  title: referralRoute.title,
  description: referralRoute.description,
  alternates: {
    canonical: absoluteUrl("/referrals")
  },
  openGraph: {
    title: referralRoute.title,
    description: referralRoute.description,
    images: [
      {
        url: absoluteUrl(seoConfig.socialPreviewPath),
        width: seoConfig.socialPreviewWidth,
        height: seoConfig.socialPreviewHeight,
        alt: referralRoute.title
      }
    ],
    url: absoluteUrl("/referrals")
  },
  twitter: {
    title: referralRoute.title,
    description: referralRoute.description,
    images: [absoluteUrl(seoConfig.socialPreviewPath)]
  }
};

export default function Page() {
  return <KoinoniaReferrals />;
}
