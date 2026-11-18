import { KoinoniaPropertiesAbout } from "../../components/site/PageAssemblies/KoinoniaPropertiesAbout";
import { buildPublicRouteMetadata } from "../../config/seo.config";

export const metadata = buildPublicRouteMetadata("/about");

export default function Page() {
  return <KoinoniaPropertiesAbout />;
}
