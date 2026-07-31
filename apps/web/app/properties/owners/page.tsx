import { KoinoniaPropertiesOwners } from "../../../components/site/PageAssemblies/KoinoniaPropertiesOwners";
import { buildPublicRouteMetadata } from "../../../config/seo.config";

export const metadata = buildPublicRouteMetadata("/properties/owners", [
  "property management owner services",
  "rental analysis",
  "tenant placement",
  "owner portal",
  "rental property management"
]);

export default function Page() {
  return <KoinoniaPropertiesOwners />;
}
