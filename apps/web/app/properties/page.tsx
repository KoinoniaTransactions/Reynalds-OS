import { KoinoniaProperties } from "../../components/site/PageAssemblies/KoinoniaProperties";
import { buildPublicRouteMetadata } from "../../config/seo.config";

export const metadata = buildPublicRouteMetadata("/properties", [
  "Koinonia Properties",
  "Colorado property management",
  "rental property management",
  "owner services",
  "tenant services"
]);

export default function Page() {
  return <KoinoniaProperties />;
}
