export type UniversalContentCardProps = {
  eyebrow?: string;
  title: string;
  text: string;
  benefits?: string[];
  actionLabel?: string;
  actionHref?: string;
};

export function UniversalContentCard({ eyebrow, title, text, benefits = [], actionLabel, actionHref }: UniversalContentCardProps) {
  return (
    <article className="koinonia-card mod-004-card">
      {eyebrow ? <span className="koinonia-card-eyebrow">{eyebrow}</span> : null}
      <h3>{title}</h3>
      <p>{text}</p>
      {benefits.length ? (
        <ul>
          {benefits.map((benefit) => <li key={benefit}>{benefit}</li>)}
        </ul>
      ) : null}
      {actionLabel && actionHref ? <a className="koinonia-text-link" href={actionHref}>{actionLabel}</a> : null}
    </article>
  );
}
