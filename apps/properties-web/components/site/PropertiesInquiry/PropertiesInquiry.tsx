import { mailto } from "../../../config/contact.config";

type InquiryKind =
  | "owner"
  | "tenant"
  | "maintenance"
  | "vendor"
  | "rental";

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
    title: "Start with the property, your goals, and the current rental status.",
    body: "A few basic property details help Koinonia Properties understand the situation and prepare for a useful first conversation.",
    subject: "Koinonia Properties Owner Inquiry",
    primaryLabel: "Email Owner Inquiry",
    details: [
      "Property address and property type",
      "Vacant, occupied, or upcoming vacancy",
      "Current rent or target rent, if known",
      "Leasing-only, full-service, or unsure"
    ],
    caution: "Please do not email bank information, payment credentials, government identification numbers, or other sensitive account data."
  },
  tenant: {
    eyebrow: "Tenant Support",
    title: "Tell us the property and the type of help you need.",
    body: "Koinonia Properties can help direct rental, application, maintenance, policy, and account-access questions to the appropriate next step.",
    subject: "Koinonia Properties Tenant Question",
    primaryLabel: "Email Tenant Question",
    details: [
      "Rental address or listing name, if applicable",
      "Question type",
      "Preferred contact method",
      "A short description of the question"
    ],
    caution: "Please do not email payment credentials, government identification numbers, or private account information."
  },
  maintenance: {
    eyebrow: "Maintenance Question",
    title: "Share the property, issue location, and a short description.",
    body: "Clear issue details and access information help Koinonia Properties understand the maintenance question and determine the appropriate next step.",
    subject: "Koinonia Properties Maintenance Question",
    primaryLabel: "Email Maintenance Question",
    details: [
      "Property address",
      "Issue location and short description",
      "Routine or urgent concern",
      "Photos or access notes, when helpful"
    ],
    caution: "For an immediate threat to life or safety, contact the appropriate local emergency service first."
  },
  vendor: {
    eyebrow: "Vendor Inquiry",
    title: "Introduce your company, trade, and service area.",
    body: "Vendor inquiries are easier to review when the basic company, trade, coverage, and contact information is included up front.",
    subject: "Koinonia Properties Vendor Inquiry",
    primaryLabel: "Email Vendor Inquiry",
    details: [
      "Company name and trade category",
      "Service area",
      "Relevant insurance or licensing information",
      "Best work-order and invoice contact"
    ],
    caution: "Please do not include tenant or owner information beyond what is necessary for the inquiry."
  },
  rental: {
    eyebrow: "Rental Analysis",
    title: "Start with the property and the owner’s goals.",
    body: "A rental analysis helps organize the property details, current rental status, timing, and management needs before the first conversation.",
    subject: "Koinonia Properties Rental Analysis Request",
    primaryLabel: "Request Rental Analysis",
    details: [
      "Property address and property type",
      "Current condition and occupancy",
      "Known maintenance or turnover concerns",
      "Owner goals and target timeline"
    ],
    caution: "Please keep the first email focused on property and contact information rather than sensitive financial or account data."
  }
};

export function PropertiesInquiry({
  kind = "owner"
}: PropertiesInquiryProps) {
  const content = inquiryContent[kind];

  return (
    <section
      className="koinonia-section"
      id={`${kind}-inquiry`}
    >
      <div className="koinonia-container">
        <div className="koinonia-inquiry">
          <div>
            <div className="koinonia-eyebrow">
              {content.eyebrow}
            </div>
            <h2 className="koinonia-heading">
              {content.title}
            </h2>
            <p className="koinonia-copy">
              {content.body}
            </p>
            <div className="koinonia-actions">
              <a
                className="koinonia-button primary"
                href={mailto(content.subject)}
              >
                {content.primaryLabel}
              </a>
              <a
                className="koinonia-button secondary"
                href="/standards"
              >
                View Standards
              </a>
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
