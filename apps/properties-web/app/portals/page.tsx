import { KoinoniaPropertiesPortals } from "../../components/site/PageAssemblies/KoinoniaPropertiesPortals";
import { buildPublicRouteMetadata } from "../../config/seo.config";

export const metadata = buildPublicRouteMetadata("/portals", [
  "owner portal",
  "tenant portal",
  "property management portal",
  "maintenance portal",
  "rent payment access"
]);

export default function Page() {
  return <KoinoniaPropertiesPortals />;
}
