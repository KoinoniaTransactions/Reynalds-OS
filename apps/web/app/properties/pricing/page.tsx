import { KoinoniaPropertiesPricing } from "../../../components/site/PageAssemblies/KoinoniaPropertiesPricing";
import { buildPublicRouteMetadata } from "../../../config/seo.config";

export const metadata = buildPublicRouteMetadata("/properties/pricing", [
  "property management pricing",
  "management fees",
  "leasing fee",
  "full-service management",
  "portfolio management"
]);

export default function Page() {
  return <KoinoniaPropertiesPricing />;
}
