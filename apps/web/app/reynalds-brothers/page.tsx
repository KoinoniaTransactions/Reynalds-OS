import { ReynaldsBrothersOperationsSystem } from "../../components/reynalds-brothers/ReynaldsBrothersOperationsSystem";

export const metadata = {
  title: {
    absolute: "Reynalds Brothers Operations | Reynalds OS"
  },
  description:
    "Company operations system for Reynalds Brothers work items, field operations, documentation, billing readiness, and customer updates.",
  applicationName: "Reynalds OS",
  openGraph: {
    title: "Reynalds Brothers Operations | Reynalds OS",
    description:
      "Company operations system for Reynalds Brothers work items, field operations, documentation, billing readiness, and customer updates.",
    siteName: "Reynalds OS"
  },
  twitter: {
    title: "Reynalds Brothers Operations | Reynalds OS",
    description:
      "Company operations system for Reynalds Brothers work items, field operations, documentation, billing readiness, and customer updates."
  }
};

export default function ReynaldsBrothersPage() {
  return <ReynaldsBrothersOperationsSystem />;
}
