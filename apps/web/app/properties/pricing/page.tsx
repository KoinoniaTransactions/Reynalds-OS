import type { Metadata } from "next";
import { KoinoniaPropertiesPricing } from "../../../components/site/PageAssemblies/KoinoniaPropertiesPricing";

export const metadata: Metadata = {
  title: "Property Management Pricing and Scope | Koinonia Properties",
  description: "Property management pricing guidance for leasing-only, full-service management, portfolio management, fees, reserves, and service scope.",
  keywords: ["property management pricing", "management fees", "leasing fee", "full-service management", "portfolio management"]
};

export default function Page() {
  return <KoinoniaPropertiesPricing />;
}
