import { KoinoniaPropertiesRealEstate } from "../../components/site/PageAssemblies/KoinoniaPropertiesRealEstate";
import { buildPublicRouteMetadata } from "../../config/seo.config";

export const metadata = buildPublicRouteMetadata("/real-estate");

export default function Page() {
  return <KoinoniaPropertiesRealEstate />;
}
