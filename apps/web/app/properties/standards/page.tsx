import type { Metadata } from "next";
import { KoinoniaPropertiesStandards } from "../../../components/site/PageAssemblies/KoinoniaPropertiesStandards";

export const metadata: Metadata = {
  title: "Property Management Operating Standards | Koinonia Properties",
  description: "Operating standards for property management owner services, tenant services, maintenance, vendors, accounting, compliance, and launch readiness.",
  keywords: ["property management standards", "owner services", "tenant services", "maintenance standards", "property management compliance"]
};

export default function Page() {
  return <KoinoniaPropertiesStandards />;
}
