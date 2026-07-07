import type { Metadata } from "next";
import { KoinoniaHomePage } from "../../components/site/KOINONIA-HOME";

export const metadata: Metadata = {
  title: "Koinonia Transactions | Real Estate Operations Support",
  description: "Organized transaction management, contract preparation, licensed showing coverage, and business support for Realtors."
};

export default function KoinoniaPublicHome() {
  return <KoinoniaHomePage />;
}
