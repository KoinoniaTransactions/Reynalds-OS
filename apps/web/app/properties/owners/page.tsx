import type { Metadata } from "next";
import { KoinoniaPropertiesOwners } from "../../../components/site/PageAssemblies/KoinoniaPropertiesOwners";

export const metadata: Metadata = {
  title: "Owner Services | Rental Property Management | Koinonia Properties",
  description: "Owner services for rental property management, rental analysis, tenant placement, maintenance coordination, owner reporting, and management planning.",
  keywords: ["property management owner services", "rental analysis", "tenant placement", "owner portal", "rental property management"]
};

export default function Page() {
  return <KoinoniaPropertiesOwners />;
}
