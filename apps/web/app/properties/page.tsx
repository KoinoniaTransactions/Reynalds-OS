import type { Metadata } from "next";
import { KoinoniaProperties } from "../../components/site/PageAssemblies/KoinoniaProperties";

export const metadata: Metadata = {
  title: "Koinonia Properties | Colorado Property Management",
  description: "Koinonia Properties provides rental property management structure for owners, tenants, and investors through Koinonia Admin.",
  keywords: ["Koinonia Properties", "Colorado property management", "rental property management", "owner services", "tenant services"]
};

export default function Page() {
  return <KoinoniaProperties />;
}
