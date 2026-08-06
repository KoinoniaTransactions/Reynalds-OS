import type {
  Metadata,
  Viewport
} from "next";

import type {
  ReactNode
} from "react";

export const metadata: Metadata = {
  title: {
    default:
      "J&M Reynalds Finances",
    template:
      "%s | J&M Reynalds Finances"
  },
  description:
    "A private household budgeting, cash-flow, account, bill, debt, and net-worth workspace.",
  applicationName:
    "J&M Reynalds Finances",
  manifest:
    "/personal/manifest.webmanifest",
  icons: {
    icon: [
      {
        url: "/personal/icon.svg",
        type: "image/svg+xml"
      }
    ],
    apple: [
      {
        url:
          "/personal/apple-icon.svg",
        type: "image/svg+xml"
      }
    ]
  }
};

export const viewport: Viewport = {
  themeColor: "#2678D4",
  colorScheme: "light"
};

export default function PersonalFinanceLayout({
  children
}: {
  children: ReactNode;
}) {
  return children;
}
