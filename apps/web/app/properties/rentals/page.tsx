import { KoinoniaPropertiesRentals } from "../../../components/site/PageAssemblies/KoinoniaPropertiesRentals";
import { buildPublicRouteMetadata } from "../../../config/seo.config";

export const metadata = buildPublicRouteMetadata("/properties/rentals", [
  "available rentals",
  "rental listings",
  "homes for rent",
  "rental application",
  "Koinonia Properties rentals"
]);

export default function Page() {
  return <KoinoniaPropertiesRentals />;
}
