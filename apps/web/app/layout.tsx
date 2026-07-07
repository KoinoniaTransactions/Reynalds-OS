import type { Metadata } from "next";
import "@reynalds-os/design-system/styles.css";

export const metadata: Metadata = {
  title: "Reynalds OS",
  description: "Koinonia ERP production application scaffold"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
