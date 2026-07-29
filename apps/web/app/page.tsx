import type { Metadata } from "next";
import { DashboardShell } from "../components/dashboard-shell";
import { absoluteUrl } from "../config/seo.config";

const title = "Reynalds OS | Business Command Center";
const description =
  "Platform dashboard for Reynalds OS company workspaces, operations, objects, finance, workflows, and intelligence.";

export const metadata: Metadata = {
  title: {
    absolute: title
  },
  description,
  alternates: {
    canonical: absoluteUrl("/")
  },
  openGraph: {
    title,
    description,
    url: absoluteUrl("/")
  },
  twitter: {
    title,
    description
  }
};

export default function Page() {
  return <DashboardShell />;
}
