import { KoinoniaPropertiesCity } from "../../../components/site/PageAssemblies/KoinoniaPropertiesCity";
import { buildPublicRouteMetadata } from "../../../config/seo.config";

export const metadata = buildPublicRouteMetadata("/property-management/parker");

export default function Page() {
  return <KoinoniaPropertiesCity slug="parker" />;
}
