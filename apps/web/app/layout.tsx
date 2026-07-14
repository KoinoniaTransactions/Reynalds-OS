import type { Metadata } from "next";
import { absoluteUrl, seoConfig } from "../config/seo.config";
import "@reynalds-os/design-system/styles.css";

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
    description: seoConfig.defaultDescription
  },
  twitter: {
    card: "summary_large_image",
    title: seoConfig.defaultTitle,
    description: seoConfig.defaultDescription
  },
  icons: {
    icon: "/icon.svg",
    apple: "/apple-icon.svg"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
