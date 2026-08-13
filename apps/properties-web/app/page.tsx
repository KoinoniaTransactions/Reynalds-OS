import { KoinoniaProperties } from "../components/site/PageAssemblies/KoinoniaProperties";
import { buildPublicRouteMetadata } from "../config/seo.config";

export const metadata = buildPublicRouteMetadata("/", [
  "Koinonia Properties",
  "property management",
  "rental property management",
  "rental analysis",
  "owner services",
  "tenant services"
]);

export default function Page() {
  return <KoinoniaProperties />;
}
