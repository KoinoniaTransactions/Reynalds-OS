import type { Metadata } from "next";
import { KoinoniaPropertiesTenants } from "../../../components/site/PageAssemblies/KoinoniaPropertiesTenants";

export const metadata: Metadata = {
  title: "Tenant Services | Rentals, Applications, Maintenance | Koinonia Properties",
  description: "Tenant services for available rentals, rental applications, rent payment direction, maintenance requests, resident policies, and portal access.",
  keywords: ["tenant services", "available rentals", "rental application", "maintenance requests", "tenant portal"]
};

export default function Page() {
  return <KoinoniaPropertiesTenants />;
}
