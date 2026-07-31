import { KoinoniaPropertiesRentalAnalysis } from "../../../components/site/PageAssemblies/KoinoniaPropertiesRentalAnalysis";
import { buildPublicRouteMetadata } from "../../../config/seo.config";

export const metadata = buildPublicRouteMetadata("/properties/rental-analysis", [
  "rental analysis",
  "property management consultation",
  "rental readiness",
  "target rent",
  "owner intake"
]);

export default function Page() {
  return <KoinoniaPropertiesRentalAnalysis />;
}
