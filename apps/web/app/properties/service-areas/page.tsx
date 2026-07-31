import type { Metadata } from "next";
import { KoinoniaPropertiesServiceAreas } from "../../../components/site/PageAssemblies/KoinoniaPropertiesServiceAreas";

export const metadata: Metadata = {
  title: "Property Management Service Areas | Koinonia Properties",
  description: "Service-area planning for Colorado rental property management, local owner questions, vendor coverage, leasing logistics, and market readiness.",
  keywords: ["property management service areas", "Colorado rental property management", "local property management", "rental owner services", "leasing support"]
};

export default function Page() {
  return <KoinoniaPropertiesServiceAreas />;
}
