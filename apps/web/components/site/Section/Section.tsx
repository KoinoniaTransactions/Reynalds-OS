import type { ReactNode } from "react";

type SectionProps = {
  eyebrow?: string;
  title?: string;
  lead?: string;
  children: ReactNode;
  variant?: "default" | "band";
  align?: "left" | "center";
  className?: string;
};

export function Section({
  eyebrow,
  title,
  lead,
  children,
  variant = "default",
  align = "left",
  className
}: SectionProps) {
  const sectionClassName = [
    "koinonia-section",
    variant === "band" ? "koinonia-band" : "",
    className ?? ""
  ]
    .filter(Boolean)
    .join(" ");

  const headerClassName = [
    "koinonia-section-header",
    align === "center" ? "center" : ""
  ]
    .filter(Boolean)
    .join(" ");

  const hasHeader = eyebrow || title || lead;

  return (
    <section className={sectionClassName}>
      <div className="koinonia-container">
        {hasHeader ? (
          <div className={headerClassName}>
            {eyebrow ? <div className="koinonia-eyebrow">{eyebrow}</div> : null}
            {title ? <h2 className="koinonia-heading">{title}</h2> : null}
            {lead ? <p className="koinonia-copy">{lead}</p> : null}
          </div>
        ) : null}

        {children}
      </div>
    </section>
  );
}