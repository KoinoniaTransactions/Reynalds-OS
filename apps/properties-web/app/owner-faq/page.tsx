import { KoinoniaPropertiesOwnerFaq } from "../../components/site/PageAssemblies/KoinoniaPropertiesOwnerFaq";
import { buildPublicRouteMetadata } from "../../config/seo.config";

export const metadata = buildPublicRouteMetadata("/owner-faq");

export default function Page() {
  return <KoinoniaPropertiesOwnerFaq />;
}
