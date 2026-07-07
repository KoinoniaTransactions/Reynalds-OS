export type PrimaryCtaProps = {
  headline: string;
  text: string;
  ctaLabel: string;
  ctaHref: string;
  phone?: string;
  sms?: string;
  email?: string;
};

export function PrimaryCta({ headline, text, ctaLabel, ctaHref, phone, sms, email }: PrimaryCtaProps) {
  return (
    <section className="koinonia-section koinonia-cta">
      <h2>{headline}</h2>
      <p>{text}</p>
      <a className="koinonia-button" href={ctaHref}>{ctaLabel}</a>
      <div className="koinonia-contact-row" aria-label="Secondary contact options">
        {phone ? <a href={`tel:${phone}`}>Call</a> : null}
        {sms ? <a href={`sms:${sms}`}>Text</a> : null}
        {email ? <a href={`mailto:${email}`}>Email</a> : null}
      </div>
    </section>
  );
}
