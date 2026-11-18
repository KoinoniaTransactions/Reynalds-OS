import { KoinoniaPropertiesHomeNotSelling } from "../../components/site/PageAssemblies/KoinoniaPropertiesHomeNotSelling";
import { buildPublicRouteMetadata } from "../../config/seo.config";

export const metadata = buildPublicRouteMetadata("/home-not-selling");

export default function Page() {
  return <KoinoniaPropertiesHomeNotSelling />;
}
