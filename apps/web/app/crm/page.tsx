import type { Metadata } from "next";

import { CrmMvp } from "../../components/crm-mvp";
import { requirePortalPermission } from "../../lib/portal-auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Relationship CRM",
  description: "Internal Koinonia staff relationship and CRM workspace.",
  robots: {
    index: false,
    follow: false
  }
};

export default async function CrmPage() {
  await requirePortalPermission("employee-portal:view", "/crm");

  return <CrmMvp />;
}
