import type { Metadata } from "next";
import { requirePortalPermission } from "../../../lib/portal-auth";
import { SocialContentStudio } from "../../../components/employee/SocialContentStudio";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Social Content Studio | Koinonia",
  description: "Internal drafts and approval workspace. Publishing is disabled.",
  robots: { index: false, follow: false }
};

export default async function SocialContentStudioPage() {
  await requirePortalPermission("employee-portal:view", "/employee/social");
  return <SocialContentStudio />;
}
