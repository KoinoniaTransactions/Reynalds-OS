import { KoinoniaPropertiesPolicies } from "../../../components/site/PageAssemblies/KoinoniaPropertiesPolicies";
import { buildPublicRouteMetadata } from "../../../config/seo.config";

export const metadata = buildPublicRouteMetadata("/properties/policies", [
  "property management policies",
  "tenant policies",
  "application criteria",
  "fair housing",
  "maintenance policy"
]);

export default function Page() {
  return <KoinoniaPropertiesPolicies />;
}
