import { KoinoniaPropertiesVendors } from "../../components/site/PageAssemblies/KoinoniaPropertiesVendors";
import { buildPublicRouteMetadata } from "../../config/seo.config";

export const metadata = buildPublicRouteMetadata("/vendors", [
  "property management vendors",
  "work orders",
  "vendor coordination",
  "maintenance vendors",
  "vendor invoices"
]);

export default function Page() {
  return <KoinoniaPropertiesVendors />;
}
