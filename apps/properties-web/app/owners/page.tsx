import { KoinoniaPropertiesOwners } from "../../components/site/PageAssemblies/KoinoniaPropertiesOwners";
import { buildPublicRouteMetadata } from "../../config/seo.config";

export const metadata = buildPublicRouteMetadata("/owners");

export default function Page() {
  return <KoinoniaPropertiesOwners />;
}
