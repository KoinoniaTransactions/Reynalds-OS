import { KoinoniaPropertiesStandards } from "../../components/site/PageAssemblies/KoinoniaPropertiesStandards";
import { buildPublicRouteMetadata } from "../../config/seo.config";

export const metadata = buildPublicRouteMetadata("/standards", [
  "property management standards",
  "owner services",
  "tenant services",
  "maintenance standards",
  "property management compliance"
]);

export default function Page() {
  return <KoinoniaPropertiesStandards />;
}
