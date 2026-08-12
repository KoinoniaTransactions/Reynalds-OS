import { KoinoniaPropertiesContact } from "@/components/site/PageAssemblies/KoinoniaPropertiesContact";
import { buildPublicRouteMetadata } from "@/config/seo.config";

export const metadata = buildPublicRouteMetadata(
  "/contact",
  [
    "Koinonia Properties contact",
    "property management contact",
    "rental property management inquiry"
  ]
);

export default function ContactPage() {
  return <KoinoniaPropertiesContact />;
}
