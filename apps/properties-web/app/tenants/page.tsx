import { KoinoniaPropertiesTenants } from "../../components/site/PageAssemblies/KoinoniaPropertiesTenants";
import { buildPublicRouteMetadata } from "../../config/seo.config";

export const metadata = buildPublicRouteMetadata("/tenants", [
  "tenant services",
  "available rentals",
  "rental application",
  "maintenance requests",
  "tenant portal"
]);

export default function Page() {
  return <KoinoniaPropertiesTenants />;
}
