import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@reynalds-os/design-system/styles.css";
import "./properties.css";
import { seoConfig, siteUrl } from "@/config/seo.config";

export const metadata: Metadata = {
  ...(siteUrl
    ? {
        metadataBase: new URL(siteUrl)
      }
    : {}),
  title: seoConfig.defaultTitle,
  description: seoConfig.defaultDescription,
  applicationName: seoConfig.siteName,
  authors: [
    {
      name: seoConfig.businessName
    }
  ],
  creator: seoConfig.businessName,
  publisher: seoConfig.businessName,
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/icon.svg",
    apple: "/apple-icon.svg"
  },
  robots: siteUrl
    ? {
        index: true,
        follow: true
      }
    : {
        index: false,
        follow: false
      }
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
