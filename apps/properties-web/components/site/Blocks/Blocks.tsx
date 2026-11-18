import type { ReactNode } from "react";
import {
  fees,
  guarantee,
  payout,
  repairApproval,
  responseStandard,
  team,
  type TeamMember
} from "../../../config/business.config";

type SectionProps = {
  eyebrow: string;
  title: string;
  lead?: string;
  band?: boolean;
  id?: string;
  children?: ReactNode;
};

export function Section({ eyebrow, title, lead, band, id, children }: SectionProps) {
  return (
    <section className={band ? "koinonia-section koinonia-band" : "koinonia-section"} id={id}>
      <div className="koinonia-container">
        <div className="koinonia-section-header">
          <div className="koinonia-eyebrow">{eyebrow}</div>
          <h2 className="koinonia-heading">{title}</h2>
          {lead ? <p className="koinonia-copy">{lead}</p> : null}
        </div>
        {children}
      </div>
    </section>
  );
}

export function PromiseStrip() {
  const promises = [
    { label: "Every fee published", detail: "No setup, vacancy or termination fees" },
    { label: guarantee.headline, detail: "Free re-placement if a tenant leaves early" },
    { label: payout.headline, detail: "Or 5 business days after late rent arrives" },
    { label: "1-hour response", detail: "Next steps within an hour in business hours" }
  ];

  return (
    <section className="koinonia-section properties-promise-section">
      <div className="koinonia-container">
        <ul className="properties-promise-strip" aria-label="Koinonia owner promises">
          {promises.map((promise) => (
            <li key={promise.label}>
              <strong>{promise.label}</strong>
              <span>{promise.detail}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function FeeTable() {
  return (
    <div className="properties-table-wrap">
      <table className="properties-table">
        <caption className="properties-visually-hidden">Koinonia Properties fee schedule</caption>
        <thead>
          <tr>
            <th scope="col">Fee</th>
            <th scope="col">Amount</th>
            <th scope="col">When it applies</th>
          </tr>
        </thead>
        <tbody>
          {fees.map((fee) => (
            <tr key={fee.name}>
              <th scope="row">{fee.name}</th>
              <td>{fee.amount}</td>
              <td>{fee.detail}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function CommitmentCards() {
  const cards = [
    { title: guarantee.headline, body: guarantee.body, items: guarantee.exclusions.map((item) => `Excluded: ${item}`) },
    { title: payout.headline, body: payout.body, items: [] as string[] },
    { title: "Repair approvals", body: repairApproval.body, items: [] as string[] },
    { title: responseStandard.headline, body: responseStandard.body, items: [] as string[] }
  ];

  return (
    <div className="koinonia-grid two">
      {cards.map((card) => (
        <article className="koinonia-card" key={card.title}>
          <h3>{card.title}</h3>
          <p>{card.body}</p>
          {card.items.length ? (
            <ul>
              {card.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : null}
        </article>
      ))}
    </div>
  );
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function PersonCard({ person }: { person: TeamMember }) {
  return (
    <article className="koinonia-card properties-person-card">
      <div className="properties-person-photo" aria-hidden={person.photo ? undefined : true}>
        {person.photo ? <img src={person.photo} alt={person.name} /> : <span>{initials(person.name)}</span>}
      </div>
      <div>
        <h3>{person.name}</h3>
        <p className="properties-person-role">{person.role}</p>
        <p>{person.bio}</p>
        {person.focus?.length ? (
          <ul>
            {person.focus.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        ) : null}
        {person.email ? (
          <p>
            <a href={`mailto:${person.email}`}>{person.email}</a>
          </p>
        ) : null}
      </div>
    </article>
  );
}

/** One person shows as a wide card; two or more switch to a grid automatically. */
export function TeamGrid({ members = team }: { members?: readonly TeamMember[] }) {
  return (
    <div className={members.length > 1 ? "properties-team-grid" : "properties-team-grid single"}>
      {members.map((person) => (
        <PersonCard key={person.name} person={person} />
      ))}
    </div>
  );
}

export function FaqJsonLd({ items }: { items: readonly { q: string; a: string }[] }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a }
    }))
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
