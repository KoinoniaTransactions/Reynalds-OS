import { mailto } from "../../../config/contact.config";

type InquiryKind = "owner" | "tenant" | "maintenance" | "vendor" | "rental";

type PropertiesInquiryProps = {
  kind?: InquiryKind;
};

const inquiryContent: Record<InquiryKind, {
  eyebrow: string;
  title: string;
  body: string;
  subject: string;
  primaryLabel: string;
  details: readonly string[];
  caution: string;
}> = {
  owner: {
    eyebrow: "Owner Inquiry",
    title: "Start with the property, the goal, and the current status.",
    body: "Owner conversations should begin with enough context to understand the property without forcing a commitment too early.",
    subject: "Koinonia Properties Owner Inquiry",
    primaryLabel: "Email Owner Inquiry",
    details: [
      "Property address and property type",
      "Vacant, occupied, or upcoming vacancy",
      "Current rent or target rent, if known",
      "Leasing-only, full-service, or unsure"
    ],
    caution: "Final management terms, reserves, trust-account handling, and owner agreement language must be confirmed before active management begins."
  },
  tenant: {
    eyebrow: "Tenant Support",
    title: "Route resident questions without collecting sensitive details too soon.",
    body: "Tenants need quick direction for listings, applications, maintenance, payments, and policy questions.",
    subject: "Koinonia Properties Tenant Question",
    primaryLabel: "Email Tenant Question",
    details: [
      "Rental address or listing name, if applicable",
      "Question type: rental, application, portal, or policy",
      "Preferred contact method",
      "Urgency level without private account information"
    ],
    caution: "Applications, payments, and maintenance requests should move through the approved portal once it is selected."
  },
  maintenance: {
    eyebrow: "Maintenance Intake",
    title: "Make maintenance trackable before dispatching work.",
    body: "The first maintenance message should help identify issue type, location, access needs, and whether urgent routing is required.",
    subject: "Koinonia Properties Maintenance Question",
    primaryLabel: "Email Maintenance Question",
    details: [
      "Property address",
      "Issue location and short description",
      "Routine or urgent concern",
      "Photos, access notes, and permission-to-enter status"
    ],
    caution: "Emergency definitions, owner approval thresholds, and vendor dispatch rules must match the management agreement."
  },
  vendor: {
    eyebrow: "Vendor Intake",
    title: "Build the vendor bench with documentation from the beginning.",
    body: "Vendor communication should create reliable records for insurance, work orders, invoices, service areas, and trade categories.",
    subject: "Koinonia Properties Vendor Inquiry",
    primaryLabel: "Email Vendor Inquiry",
    details: [
      "Company name and trade category",
      "Service area",
      "Insurance and licensing status",
      "Preferred work-order and invoice contact"
    ],
    caution: "Vendors should be approved before dispatch, and invoices should follow one standard submission path."
  },
  rental: {
    eyebrow: "Rental Analysis",
    title: "Use the analysis path to turn owner interest into a clear next step.",
    body: "A rental analysis should clarify property readiness, likely management fit, and the first operating recommendation.",
    subject: "Koinonia Properties Rental Analysis Request",
    primaryLabel: "Request Rental Analysis",
    details: [
      "Property address and property type",
      "Current condition and occupancy",
      "Known maintenance or inspection concerns",
      "Owner goals and target timeline"
    ],
    caution: "Rental estimates, listing promises, and management recommendations should be confirmed against local rules and market data before publication."
  }
};

export function PropertiesInquiry({ kind = "owner" }: PropertiesInquiryProps) {
  const content = inquiryContent[kind];

  return (
    <section className="koinonia-section">
      <div className="koinonia-container">
        <div className="koinonia-inquiry">
          <div>
            <div className="koinonia-eyebrow">{content.eyebrow}</div>
            <h2 className="koinonia-heading">{content.title}</h2>
            <p className="koinonia-copy">{content.body}</p>
            <div className="koinonia-actions">
              <a className="koinonia-button primary" href={mailto(content.subject)}>{content.primaryLabel}</a>
              <a className="koinonia-button secondary" href="/properties/standards">View Standards</a>
            </div>
          </div>
          <div className="koinonia-inquiry-card">
            <h3>Helpful first details</h3>
            <ul>
              {content.details.map((detail) => (
                <li key={detail}>{detail}</li>
              ))}
            </ul>
            <p>{content.caution}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
