import type { Metadata } from "next";
import { KoinoniaPropertiesPolicies } from "../../../components/site/PageAssemblies/KoinoniaPropertiesPolicies";

export const metadata: Metadata = {
  title: "Property Management Policies | Koinonia Properties",
  description: "Property management policy planning for owner rules, tenant policies, applications, maintenance, fair housing, privacy, and compliance readiness.",
  keywords: ["property management policies", "tenant policies", "application criteria", "fair housing", "maintenance policy"]
};

export default function Page() {
  return <KoinoniaPropertiesPolicies />;
}
