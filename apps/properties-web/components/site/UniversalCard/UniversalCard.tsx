export type UniversalCardProps = {
  eyebrow?: string;
  title: string;
  body: string;
  items?: readonly string[];
  actionLabel?: string;
  actionHref?: string;
};

export function UniversalCard({ eyebrow, title, body, items = [], actionLabel, actionHref }: UniversalCardProps) {
  return (
    <article className="koinonia-card">
      {eyebrow ? <div className="koinonia-icon">{eyebrow}</div> : null}
      <h3>{title}</h3>
      <p>{body}</p>
      {items.length ? (
        <ul>
          {items.map((item) => <li key={item}>{item}</li>)}
        </ul>
      ) : null}
      {actionLabel && actionHref ? (
        <div className="koinonia-actions">
          <a className="koinonia-button secondary" href={actionHref}>{actionLabel}</a>
        </div>
      ) : null}
    </article>
  );
}
