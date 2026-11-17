import { requirePortalPermission } from "../../../lib/portal-auth";
import { KoinoniaMarketingDashboard } from "../../../components/employee/KoinoniaMarketingDashboard";
export const dynamic = "force-dynamic";
export const metadata = { title: "Marketing and acquisition | Koinonia", robots: { index: false, follow: false } };
export default async function MarketingPage() {
  await requirePortalPermission("employee-portal:view", "/employee/marketing");
  return <KoinoniaMarketingDashboard />;
}
