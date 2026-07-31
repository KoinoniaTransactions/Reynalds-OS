import type { Metadata } from "next";
import { KoinoniaPropertiesVendors } from "../../../components/site/PageAssemblies/KoinoniaPropertiesVendors";

export const metadata: Metadata = {
  title: "Property Management Vendors | Work Orders | Koinonia Properties",
  description: "Vendor coordination standards for property management work orders, insurance, service areas, invoices, maintenance dispatch, and emergency routing.",
  keywords: ["property management vendors", "work orders", "vendor coordination", "maintenance vendors", "vendor invoices"]
};

export default function Page() {
  return <KoinoniaPropertiesVendors />;
}
