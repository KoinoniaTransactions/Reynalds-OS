import { KoinoniaPropertiesServiceAreas } from "../../../components/site/PageAssemblies/KoinoniaPropertiesServiceAreas";
import { buildPublicRouteMetadata } from "../../../config/seo.config";

export const metadata = buildPublicRouteMetadata("/properties/service-areas", [
  "property management service areas",
  "Colorado rental property management",
  "local property management",
  "rental owner services",
  "leasing support"
]);

export default function Page() {
  return <KoinoniaPropertiesServiceAreas />;
}
