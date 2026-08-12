type PropertiesSeoContentProps = {
  variant: string;
};

const copy: Record<string, {
  eyebrow: string;
  title: string;
  body: string;
}> = {
  home: {
    eyebrow: "Property Management",
    title: "Clear property management paths for owners and residents.",
    body: "Koinonia Properties provides organized support for rental analysis, leasing, property oversight, maintenance coordination, owner communication, and resident questions."
  },
  owners: {
    eyebrow: "For Property Owners",
    title: "Start with the property and the owner’s goals.",
    body: "Owners can begin with a rental analysis, review service options, discuss pricing and timing, and create a clearer plan for the property."
  },
  tenants: {
    eyebrow: "For Residents",
    title: "Find the right next step without searching through another website.",
    body: "Residents can use Koinonia Properties for rental availability, application guidance, maintenance information, policy direction, and account-access help."
  },
  rentals: {
    eyebrow: "Available Rentals",
    title: "Rental availability and tenant next steps.",
    body: "Public listings appear on the Rentals page when properties are available, with application and contact guidance tied to the property."
  },
  portals: {
    eyebrow: "Secure Access",
    title: "Public information here. Private account activity stays secure.",
    body: "Owners and residents receive secure access instructions directly when online account access is available for their property."
  },
  "rental-analysis": {
    eyebrow: "Rental Analysis",
    title: "A practical first step for rental property owners.",
    body: "A rental analysis starts with the property address, condition, occupancy, owner goals, and timing so the next management step can be discussed clearly."
  },
  pricing: {
    eyebrow: "Pricing and Scope",
    title: "Pricing starts with the property and requested service level.",
    body: "Koinonia Properties reviews the property, management needs, occupancy, timing, and portfolio size before discussing a service quote."
  },
  "service-areas": {
    eyebrow: "Service Availability",
    title: "Start with the property address.",
    body: "Service availability is confirmed by reviewing the location, property needs, timing, and requested management scope."
  },
  apply: {
    eyebrow: "Rental Applications",
    title: "Applications begin with an active rental listing.",
    body: "Review the listing details and follow the application instructions provided for the property you are interested in."
  },
  maintenance: {
    eyebrow: "Maintenance",
    title: "Clear issue details help maintenance move forward.",
    body: "Residents can use the Maintenance page for routine issue guidance, property details to prepare, and the appropriate contact path."
  },
  contact: {
    eyebrow: "Contact Koinonia Properties",
    title: "Start with the question or property you need help with.",
    body: "Owners, residents, rental prospects, maintenance contacts, and vendors can use the Koinonia Properties contact page to find the appropriate next step without being routed through another Koinonia website."
  },
};

const fallback = {
  eyebrow: "Koinonia Properties",
  title: "Clear information for the property and the next step.",
  body: "Koinonia Properties keeps public information focused on property services, owner and resident communication, and practical next steps."
};

export function PropertiesSeoContent({
  variant
}: PropertiesSeoContentProps) {
  const content = copy[variant] ?? fallback;

  return (
    <section className="koinonia-section koinonia-band">
      <div className="koinonia-container">
        <div className="koinonia-section-header">
          <div className="koinonia-eyebrow">
            {content.eyebrow}
          </div>
          <h2 className="koinonia-heading">
            {content.title}
          </h2>
          <p className="koinonia-copy">
            {content.body}
          </p>
        </div>
      </div>
    </section>
  );
}
