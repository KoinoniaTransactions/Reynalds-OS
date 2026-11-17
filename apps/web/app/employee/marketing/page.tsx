import { requirePortalPermission } from "../../../lib/portal-auth";
import { KoinoniaMarketingDashboard } from "../../../components/employee/KoinoniaMarketingDashboard";
import { KoinoniaProspectImport } from "../../../components/employee/KoinoniaProspectImport";
export const dynamic = "force-dynamic";
export const metadata = { title: "Marketing and acquisition | Koinonia", robots: { index: false, follow: false } };
export default async function MarketingPage() {
  const actor = await requirePortalPermission("employee-portal:view", "/employee/marketing");
  return <KoinoniaMarketingDashboard>{actor.role === "Owner" && process.env.VERCEL_ENV === "preview" && <KoinoniaProspectImport />}</KoinoniaMarketingDashboard>;
}
