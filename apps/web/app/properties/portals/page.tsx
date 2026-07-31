import type { Metadata } from "next";
import { KoinoniaPropertiesPortals } from "../../../components/site/PageAssemblies/KoinoniaPropertiesPortals";

export const metadata: Metadata = {
  title: "Owner and Tenant Portals | Property Management Access | Koinonia Properties",
  description: "Portal strategy for owner statements, tenant rent payment direction, maintenance requests, lease documents, vendor work orders, and account access.",
  keywords: ["owner portal", "tenant portal", "property management portal", "maintenance portal", "rent payment access"]
};

export default function Page() {
  return <KoinoniaPropertiesPortals />;
}
