import type { Metadata } from "next";
import { KoinoniaServicesPage } from "../../../components/site/KOINONIA-SERVICES";

export const metadata: Metadata = {
  title: "Services & Pricing | Koinonia Transactions",
  description: "Real estate operations support for Realtors, including transaction management, contract preparation, licensed showing coverage, and business support."
};

export default function KoinoniaServicesAndPricing() {
  return <KoinoniaServicesPage />;
}
