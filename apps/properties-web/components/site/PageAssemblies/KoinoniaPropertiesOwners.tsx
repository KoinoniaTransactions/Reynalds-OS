import { FAQ, Footer, Hero, PropertiesNav, UniversalCard } from "../index";

const ownerPriorities = [
  {
    title: "Keep the property moving",
    body: "Leasing activity, resident communication, maintenance, vendors, records, and owner decisions all need a clear path forward.",
    items: ["Defined next steps", "Organized follow-through", "Clear ownership of decisions"]
  },
  {
    title: "Keep decisions visible",
    body: "Owners should know what happened, what needs attention, and what decision is needed without having to chase scattered updates.",
    items: ["Useful owner updates", "Decision points called out", "Property-specific context"]
  },
  {
    title: "Keep care responsible",
    body: "Good management balances resident needs, property condition, owner priorities, agreed scope, and documented responsibilities.",
    items: ["Property-focused coordination", "Responsible escalation", "Clear service boundaries"]
  }
];

const ownerServices = [
  {
    title: "Rental Analysis & Property Review",
    body: "Start with the property, current rental status, condition, timing, and owner goals before defining the management path.",
    items: ["Property review", "Rental readiness", "Owner goals and timing"]
  },
  {
    title: "Marketing, Leasing & Applicant Coordination",
    body: "Coordinate rental preparation, marketing, applicant communication, screening steps, and the path toward a signed lease.",
    items: ["Listing preparation", "Applicant communication", "Screening coordination"]
  },
  {
    title: "Lease & Resident Onboarding",
    body: "Keep lease administration, move-in coordination, resident communication, and property-specific expectations organized from the start.",
    items: ["Lease administration", "Move-in coordination", "Resident communication"]
  },
  {
    title: "Rent Process & Owner Communication",
    body: "Coordinate agreed rent-collection workflows, owner updates, records, and reporting through the appropriate management process.",
    items: ["Rent-process coordination", "Owner updates", "Reporting and records"]
  },
  {
    title: "Maintenance & Vendor Coordination",
    body: "Organize maintenance communication, vendor coordination, access details, approval needs, and follow-through around property work.",
    items: ["Issue coordination", "Vendor communication", "Owner approval when applicable"]
  },
  {
    title: "Move-Out & Ongoing Property Support",
    body: "Support move-out coordination, turnover planning, ongoing property needs, and the next operating step for the rental.",
    items: ["Move-out coordination", "Turnover planning", "Ongoing management support"]
  }
];

const leasingSteps = [
  "Review rental readiness, property details, and owner timing",
  "Prepare and coordinate the agreed marketing approach",
  "Keep applicant communication and screening coordination organized",
  "Support lease administration and property-specific onboarding",
  "Coordinate move-in details and the handoff into ongoing management"
];

const maintenanceSteps = [
  "Understand the issue, property location, access needs, and available details",
  "Coordinate the appropriate vendor or next action through the management process",
  "Identify owner approval or decision points when the scope requires them",
  "Keep resident and owner communication moving as the work progresses",
  "Document the outcome and carry forward any relevant property follow-up"
];

const ownerVisibility = [
  {
    title: "What happened",
    body: "Receive organized context around meaningful leasing, resident, maintenance, and property-management activity."
  },
  {
    title: "What needs attention",
    body: "Important questions, approval needs, and property decisions should be surfaced clearly instead of buried in scattered communication."
  },
  {
    title: "What comes next",
    body: "The next operating step should be understandable so the owner knows what Koinonia is coordinating and where owner input is needed."
  }
];

const managementProcess = [
  {
    title: "Understand the Property",
    body: "Review the property, current rental status, condition, timing, and owner goals before defining the next step."
  },
  {
    title: "Clarify Responsibilities",
    body: "Confirm the agreed management scope, decision points, communication path, and property-specific responsibilities."
  },
  {
    title: "Coordinate Leasing or Onboarding",
    body: "Prepare the property for the applicable leasing, resident, or management onboarding work."
  },
  {
    title: "Manage the Ongoing Work",
    body: "Coordinate the agreed rent, maintenance, resident communication, vendor, record, and reporting workflows."
  },
  {
    title: "Keep the Owner Informed",
    body: "Deliver organized updates, surface decisions, and keep the owner connected to what is happening with the property."
  }
];

const ownerFaqs = [
  {
    q: "What does a property management company typically handle?",
    a: "Property management can include rental analysis, leasing coordination, applicant screening coordination, lease administration, rent-process coordination, maintenance, resident communication, owner updates, vendor coordination, move-in and move-out support, and ongoing property oversight. The exact scope should be confirmed for the specific property and engagement."
  },
  {
    q: "How does Koinonia Properties coordinate maintenance?",
    a: "Koinonia Properties organizes issue details, resident communication, vendor coordination, access information, owner approval needs when applicable, and follow-through through the management process. Property-specific responsibilities and approval thresholds are confirmed before management begins."
  },
  {
    q: "How will I know what is happening with my property?",
    a: "Owner communication is built around organized updates, clear decision points, and understandable next steps. Reporting and private account information are handled through the appropriate private workflow rather than through ordinary public website pages."
  },
  {
    q: "What happens during leasing?",
    a: "The leasing path can include rental-readiness review, listing preparation, applicant communication, screening coordination, lease administration, and move-in coordination as applicable to the agreed service scope."
  },
  {
    q: "How are pricing and management scope determined?",
    a: "Pricing and scope depend on factors such as property type, condition, occupancy, leasing status, requested services, timing, and portfolio complexity. For owners with multiple rentals, portfolio size and coordination needs can be considered as part of that conversation. Koinonia Properties starts with the property before discussing the appropriate management scope and quote."
  },
  {
    q: "What should I prepare for a rental analysis?",
    a: "Start with the property address, property type, current condition and occupancy, current rental status or upcoming vacancy, known maintenance or turnover concerns, owner goals, and target timing. Sensitive financial or private account information should not be sent through ordinary public-site intake."
  }
];

export function KoinoniaPropertiesOwners() {
  return (
    <main className="koinonia-site">
      <PropertiesNav />
      <Hero
        visualVariant="properties"
        eyebrow="Rental Property Management for Owners"
        title="Organized property management. Clear owner visibility. Responsible care."
        lead="Koinonia Properties helps rental property owners keep leasing, resident communication, rent processes, maintenance, vendors, reporting, and day-to-day property work organized and moving forward."
        primaryLabel="Request Rental Analysis"
        primaryHref="/rental-analysis"
        secondaryLabel="Pricing & Scope"
        secondaryHref="/pricing"
      />

      <section className="koinonia-section">
        <div className="koinonia-container">
          <div className="koinonia-section-header">
            <div className="koinonia-eyebrow">What Owners Need</div>
            <h2 className="koinonia-heading">Property management should reduce uncertainty, not create another layer of it.</h2>
            <p className="koinonia-copy">
              A rental property has moving parts: leasing, residents, maintenance, rent processes, vendors, records, and owner decisions. Koinonia Properties brings those responsibilities into a clearer operating rhythm so owners can understand what is happening and what comes next.
            </p>
          </div>
          <div className="koinonia-grid three">
            {ownerPriorities.map((priority) => (
              <UniversalCard
                key={priority.title}
                title={priority.title}
                body={priority.body}
                items={priority.items}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="koinonia-section koinonia-band">
        <div className="koinonia-container">
          <div className="koinonia-section-header">
            <div className="koinonia-eyebrow">Property Management Services</div>
            <h2 className="koinonia-heading">The work around a rental property stays connected.</h2>
            <p className="koinonia-copy">
              Koinonia Properties may coordinate the following service areas based on the property and agreed management scope. Not every engagement includes every service, and property-specific responsibilities are confirmed before work begins.
            </p>
          </div>
          <div className="koinonia-grid three">
            {ownerServices.map((service, index) => (
              <UniversalCard
                key={service.title}
                eyebrow={`0${index + 1}`}
                title={service.title}
                body={service.body}
                items={service.items}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="koinonia-section">
        <div className="koinonia-container">
          <div className="koinonia-split properties-owner-detail-split">
            <div>
              <div className="koinonia-eyebrow">Leasing & Resident Placement</div>
              <h2 className="koinonia-heading">A stronger leasing process starts before the listing goes live.</h2>
              <p className="koinonia-copy">
                Rental readiness, applicant communication, screening coordination, lease administration, and move-in details all affect how smoothly a property transitions into ongoing management.
              </p>
            </div>
            <ul className="properties-owner-detail-list">
              {leasingSteps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="koinonia-section koinonia-band">
        <div className="koinonia-container">
          <div className="koinonia-split properties-owner-detail-split">
            <div>
              <div className="koinonia-eyebrow">Maintenance & Property Care</div>
              <h2 className="koinonia-heading">Maintenance needs a process, not a trail of disconnected messages.</h2>
              <p className="koinonia-copy">
                Koinonia Properties coordinates the people, information, approvals, and follow-through around property maintenance so the owner and resident have a clearer path through the issue.
              </p>
            </div>
            <ul className="properties-owner-detail-list">
              {maintenanceSteps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="koinonia-section">
        <div className="koinonia-container">
          <div className="koinonia-section-header">
            <div className="koinonia-eyebrow">Owner Communication</div>
            <h2 className="koinonia-heading">Know what is happening with your property—and what comes next.</h2>
            <p className="koinonia-copy">
              Clear owner communication is more than sending information. It means putting property activity in context, surfacing decisions, and making the next step understandable.
            </p>
          </div>
          <div className="koinonia-grid three">
            {ownerVisibility.map((item) => (
              <UniversalCard
                key={item.title}
                title={item.title}
                body={item.body}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="koinonia-section koinonia-band">
        <div className="koinonia-container">
          <div className="koinonia-section-header">
            <div className="koinonia-eyebrow">How Management Begins</div>
            <h2 className="koinonia-heading">Start with the property. Clarify the plan. Keep the work organized.</h2>
          </div>
          <div className="koinonia-grid properties-process-grid">
            {managementProcess.map((step, index) => (
              <UniversalCard
                key={step.title}
                eyebrow={`0${index + 1}`}
                title={step.title}
                body={step.body}
              />
            ))}
          </div>
        </div>
      </section>

      <FAQ
        items={ownerFaqs}
        eyebrow="Owner Questions"
        title="What owners should understand before choosing a property manager."
      />

      <section className="koinonia-section koinonia-band">
        <div className="koinonia-container">
          <div className="koinonia-section-header">
            <div className="koinonia-eyebrow">Start With the Property</div>
            <h2 className="koinonia-heading">A better management conversation starts with understanding the rental.</h2>
            <p className="koinonia-copy">
              Share the property, current rental status, timing, known concerns, and your goals. Koinonia Properties will use that context to begin the right management conversation without asking you to send sensitive financial or private account information through the public website.
            </p>
            <div className="koinonia-actions">
              <a className="koinonia-button primary" href="/rental-analysis">
                Request Rental Analysis
              </a>
              <a className="koinonia-button secondary" href="/standards">
                View Management Standards
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer serviceLine="Koinonia Properties" supportLine="Owner services" />
    </main>
  );
}
