"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./ServicePricingExperience.module.css";

type PricingProduct = {
  id: string;
  title: string;
  priceLabel: string;
  priceNote: string;
  body: string;
  items: readonly string[];
  ctaLabel: string;
  secondaryPrice?: string;
};

type ServiceDetail = {
  id: string;
  eyebrow: string;
  title: string;
  headline: string;
  body: string;
  handUs: readonly string[];
  handles: readonly string[];
  included: readonly string[];
  separate: readonly string[];
  remains: readonly string[];
  exampleTitle: string;
  exampleBody: string;
  ctaLabel: string;
};

type ServicePricingExperienceProps = {
  products: readonly PricingProduct[];
  details: readonly ServiceDetail[];
};

export function ServicePricingExperience({
  products,
  details
}: ServicePricingExperienceProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const lastTriggerRef = useRef<HTMLButtonElement | null>(null);
  const [activeDetailId, setActiveDetailId] = useState<string | null>(null);

  const activeDetail = activeDetailId
    ? details.find((detail) => detail.id === activeDetailId) ?? null
    : null;

  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog || !activeDetail) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    if (!dialog.open) {
      dialog.showModal();
    }

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [activeDetail]);

  function openDetail(productId: string, trigger: HTMLButtonElement) {
    lastTriggerRef.current = trigger;
    setActiveDetailId(productId);
  }

  function closeDetail() {
    dialogRef.current?.close();
  }

  function handleDialogClose() {
    setActiveDetailId(null);

    window.requestAnimationFrame(() => {
      lastTriggerRef.current?.focus();
    });
  }

  function handleBackdropClick(event: React.MouseEvent<HTMLDialogElement>) {
    if (event.target === event.currentTarget) {
      closeDetail();
    }
  }

  return (
    <>
      <div className="koinonia-grid three">
        {products.map((product) => (
          <article key={product.id} className="koinonia-card koinonia-pricing-card">
            <div className="koinonia-price-badge">
              <span className="koinonia-price-badge-label">{product.priceNote}</span>
              <span className="koinonia-price-badge-value">{product.priceLabel}</span>
            </div>

            <h3>{product.title}</h3>
            <p>{product.body}</p>

            <ul>
              {product.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>

            {product.secondaryPrice ? (
              <p className="koinonia-copy">
                <strong>{product.secondaryPrice}</strong>
              </p>
            ) : null}

            <div className={`koinonia-actions ${styles.cardActions}`}>
              <button
                type="button"
                className={`koinonia-button secondary ${styles.detailTrigger}`}
                onClick={(event) => openDetail(product.id, event.currentTarget)}
                aria-haspopup="dialog"
              >
                See everything included
              </button>
              <a className="koinonia-button primary" href="/contact#schedule-consultation">
                {product.ctaLabel}
              </a>
            </div>
          </article>
        ))}
      </div>

      <dialog
        ref={dialogRef}
        className={styles.dialog}
        aria-labelledby="koinonia-service-detail-title"
        aria-describedby="koinonia-service-detail-description"
        onClose={handleDialogClose}
        onClick={handleBackdropClick}
      >
        {activeDetail ? (
          <div className={styles.dialogShell}>
            <header className={styles.dialogHeader}>
              <div>
                <div className="koinonia-eyebrow">{activeDetail.eyebrow}</div>
                <h2 id="koinonia-service-detail-title" className={styles.dialogTitle}>
                  {activeDetail.title}
                </h2>
                <p className={styles.dialogHeadline}>{activeDetail.headline}</p>
                <p id="koinonia-service-detail-description" className={styles.dialogDescription}>
                  {activeDetail.body}
                </p>
              </div>

              <button
                type="button"
                className={styles.closeButton}
                onClick={closeDetail}
                aria-label={`Close ${activeDetail.title} details`}
              >
                <span aria-hidden="true">×</span>
              </button>
            </header>

            <div className={styles.dialogBody}>
              <div className={styles.detailGrid}>
                <DetailGroup title="What you hand us" items={activeDetail.handUs} />
                <DetailGroup title="What Koinonia handles" items={activeDetail.handles} />
                <DetailGroup title="Included in the price" items={activeDetail.included} />
                <DetailGroup title="What may be separate" items={activeDetail.separate} />
                <DetailGroup title="What remains with you" items={activeDetail.remains} />

                <section className={`${styles.detailGroup} ${styles.exampleGroup}`}>
                  <div className={styles.groupLabel}>REAL-WORLD EXAMPLE</div>
                  <h3>{activeDetail.exampleTitle}</h3>
                  <p>{activeDetail.exampleBody}</p>
                </section>
              </div>
            </div>

            <footer className={styles.dialogFooter}>
              <button
                type="button"
                className={`koinonia-button secondary ${styles.footerButton}`}
                onClick={closeDetail}
              >
                Back to pricing
              </button>
              <a
                className={`koinonia-button primary ${styles.footerButton}`}
                href="/contact#schedule-consultation"
              >
                {activeDetail.ctaLabel}
              </a>
            </footer>
          </div>
        ) : null}
      </dialog>
    </>
  );
}

function DetailGroup({ title, items }: { title: string; items: readonly string[] }) {
  return (
    <section className={styles.detailGroup}>
      <h3>{title}</h3>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}
