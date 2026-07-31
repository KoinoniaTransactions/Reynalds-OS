import type { Metadata } from "next";
import { KoinoniaPropertiesRentals } from "../../../components/site/PageAssemblies/KoinoniaPropertiesRentals";

export const metadata: Metadata = {
  title: "Available Rentals | Rental Listings | Koinonia Properties",
  description: "Available rentals, upcoming rental listings, application criteria, showing direction, and tenant next steps from Koinonia Properties.",
  keywords: ["available rentals", "rental listings", "homes for rent", "rental application", "Koinonia Properties rentals"]
};

export default function Page() {
  return <KoinoniaPropertiesRentals />;
}
