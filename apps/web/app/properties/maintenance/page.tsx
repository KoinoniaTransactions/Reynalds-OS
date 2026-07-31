import type { Metadata } from "next";
import { KoinoniaPropertiesMaintenance } from "../../../components/site/PageAssemblies/KoinoniaPropertiesMaintenance";

export const metadata: Metadata = {
  title: "Maintenance Requests | Property Management Maintenance | Koinonia Properties",
  description: "Maintenance request workflow for tenants, owners, vendors, emergency routing, approval thresholds, work orders, and closeout records.",
  keywords: ["maintenance requests", "property management maintenance", "work orders", "vendor coordination", "emergency maintenance"]
};

export default function Page() {
  return <KoinoniaPropertiesMaintenance />;
}
