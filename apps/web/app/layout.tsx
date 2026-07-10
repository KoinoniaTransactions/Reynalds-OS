import type { Metadata } from "next";
import "@reynalds-os/design-system/styles.css";

export const metadata: Metadata = {
  title: {
    default: "Koinonia",
    template: "%s | Koinonia"
  },
  description: "Real estate operations support for Realtors.",
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
