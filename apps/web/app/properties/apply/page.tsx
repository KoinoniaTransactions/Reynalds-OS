import { KoinoniaPropertiesApply } from "../../../components/site/PageAssemblies/KoinoniaPropertiesApply";
import { buildPublicRouteMetadata } from "../../../config/seo.config";

export const metadata = buildPublicRouteMetadata("/properties/apply", [
  "apply for a rental",
  "rental application",
  "application criteria",
  "tenant screening",
  "available rentals"
]);

export default function Page() {
  return <KoinoniaPropertiesApply />;
}
