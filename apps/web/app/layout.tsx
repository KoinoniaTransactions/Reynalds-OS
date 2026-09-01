import type { Metadata } from "next";
import { absoluteUrl, seoConfig } from "../config/seo.config";
import { AuthProvider } from "../components/auth/AuthProvider";
import { MarketingAttribution } from "../components/site/MarketingAttribution/MarketingAttribution";
import "@reynalds-os/design-system/styles.css";
import "../styles/koinonia-layout.css";
import "../styles/transaction-intake-controls.css";

export const metadata: Metadata = {
  metadataBase: new URL(seoConfig.siteUrl),
  title: {
    default: seoConfig.defaultTitle,
    template: seoConfig.titleTemplate
  },
  description: seoConfig.defaultDescription,
  applicationName: seoConfig.siteName,
  authors: [{ name: seoConfig.businessName }],
  creator: seoConfig.businessName,
  publisher: seoConfig.businessName,
  alternates: {
    canonical: absoluteUrl("/")
  },
  openGraph: {
    type: "website",
    locale: seoConfig.locale,
    url: absoluteUrl("/"),
    siteName: seoConfig.siteName,
    title: seoConfig.defaultTitle,
    description: seoConfig.defaultDescription,
    images: [
      {
        url: absoluteUrl(seoConfig.socialPreviewPath),
        width: seoConfig.socialPreviewWidth,
        height: seoConfig.socialPreviewHeight,
        alt: seoConfig.defaultTitle
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: seoConfig.defaultTitle,
    description: seoConfig.defaultDescription,
    images: [
      {
        url: absoluteUrl(seoConfig.socialPreviewPath),
        width: seoConfig.socialPreviewWidth,
        height: seoConfig.socialPreviewHeight,
        alt: seoConfig.defaultTitle
      }
    ]
  },
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/icon.svg",
    apple: "/apple-icon.svg"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <MarketingAttribution />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
