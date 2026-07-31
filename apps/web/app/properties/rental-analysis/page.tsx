import type { Metadata } from "next";
import { KoinoniaPropertiesRentalAnalysis } from "../../../components/site/PageAssemblies/KoinoniaPropertiesRentalAnalysis";

export const metadata: Metadata = {
  title: "Rental Analysis | Property Management Consultation | Koinonia Properties",
  description: "Request a rental analysis for property management fit, rental readiness, target rent, owner goals, and service-level planning.",
  keywords: ["rental analysis", "property management consultation", "rental readiness", "target rent", "owner intake"]
};

export default function Page() {
  return <KoinoniaPropertiesRentalAnalysis />;
}
