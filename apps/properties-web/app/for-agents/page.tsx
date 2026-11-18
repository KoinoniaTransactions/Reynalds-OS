import { KoinoniaPropertiesForAgents } from "../../components/site/PageAssemblies/KoinoniaPropertiesForAgents";
import { buildPublicRouteMetadata } from "../../config/seo.config";

export const metadata = buildPublicRouteMetadata("/for-agents");

export default function Page() {
  return <KoinoniaPropertiesForAgents />;
}
