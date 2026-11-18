import { KoinoniaPropertiesCity } from "../../../components/site/PageAssemblies/KoinoniaPropertiesCity";
import { buildPublicRouteMetadata } from "../../../config/seo.config";

export const metadata = buildPublicRouteMetadata("/property-management/castle-rock");

export default function Page() {
  return <KoinoniaPropertiesCity slug="castle-rock" />;
}
