import { KoinoniaProperties } from "../components/site/PageAssemblies/KoinoniaProperties";
import { buildPublicRouteMetadata } from "../config/seo.config";

export const metadata = buildPublicRouteMetadata("/");

export default function Page() {
  return <KoinoniaProperties />;
}
