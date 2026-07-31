import { KoinoniaPropertiesMaintenance } from "../../../components/site/PageAssemblies/KoinoniaPropertiesMaintenance";
import { buildPublicRouteMetadata } from "../../../config/seo.config";

export const metadata = buildPublicRouteMetadata("/properties/maintenance", [
  "maintenance requests",
  "property management maintenance",
  "work orders",
  "vendor coordination",
  "emergency maintenance"
]);

export default function Page() {
  return <KoinoniaPropertiesMaintenance />;
}
