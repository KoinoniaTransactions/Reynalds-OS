import type { Metadata } from "next";
import { KoinoniaPropertiesApply } from "../../../components/site/PageAssemblies/KoinoniaPropertiesApply";

export const metadata: Metadata = {
  title: "Apply for a Rental | Rental Application | Koinonia Properties",
  description: "Rental application process, applicant expectations, screening criteria planning, application policies, and listing-based application next steps.",
  keywords: ["apply for a rental", "rental application", "application criteria", "tenant screening", "available rentals"]
};

export default function Page() {
  return <KoinoniaPropertiesApply />;
}
