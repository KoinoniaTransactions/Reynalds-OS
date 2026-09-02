import type { Metadata } from "next";
import { KoinoniaCoverage } from "../../components/site/PageAssemblies/KoinoniaCoverage";
import { absoluteUrl, seoConfig } from "../../config/seo.config";

const title = "Real Estate Operations Coverage for Colorado Realtors | Koinonia";
const description =
  "Transaction management is only part of the job. Explore Koinonia support across licensed showings, professional open houses, contract and document support, transaction management, closing preparation, and day-to-day real estate operations.";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: absoluteUrl("/coverage")
  },
  openGraph: {
    title,
    description,
    url: absoluteUrl("/coverage"),
    images: [
      {
        url: absoluteUrl(seoConfig.socialPreviewPath),
        width: seoConfig.socialPreviewWidth,
        height: seoConfig.socialPreviewHeight,
        alt: title
      }
    ]
  },
  twitter: {
    title,
    description,
    images: [absoluteUrl(seoConfig.socialPreviewPath)]
  }
};

export default function Page() {
  return <KoinoniaCoverage />;
}
