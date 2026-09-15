"use client";

import { useEffect, useId, useRef } from "react";
import styles from "./ServiceDetailDialog.module.css";

export type ServiceDetail = {
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

type ServiceDetailDialogProps = {
  detail: ServiceDetail;
  quietTrigger?: boolean;
};

export function ServiceDetailDialog({ detail, quietTrigger = false }: ServiceDetailDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const previousBodyOverflowRef = useRef("");
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog) {
      return;
    }

    const handleClose = () => {
      document.body.style.overflow = previousBodyOverflowRef.current;
      triggerRef.current?.focus();
    };

    dialog.addEventListener("close", handleClose);

    return () => {
      dialog.removeEventListener("close", handleClose);
      document.body.style.overflow = previousBodyOverflowRef.current;
    };
  }, []);

  const openDetails = () => {
    const dialog = dialogRef.current;

    if (!dialog || dialog.open) {
      return;
    }

    previousBodyOverflowRef.current = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog.showModal();
  };

  const closeDetails = () => {
    const dialog = dialogRef.current;

    if (dialog?.open) {
      dialog.close();
    }
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={
          quietTrigger
            ? `${styles.trigger} ${styles.quietTrigger}`
            : `koinonia-button secondary ${styles.trigger}`
        }
        onClick={openDetails}
        aria-haspopup="dialog"
      >
        See everything included
      </button>

      <dialog
        ref={dialogRef}
        className={styles.dialog}
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            closeDetails();
          }
        }}
      >
        <div className={styles.surface}>
          <header className={styles.header}>
            <div>
              <div className="koinonia-eyebrow">{detail.eyebrow}</div>
              <h2 id={titleId} className={styles.title}>
                {detail.title}
              </h2>
              <p className={styles.headline}>{detail.headline}</p>
            </div>

            <button
              type="button"
              className={styles.iconClose}
              onClick={closeDetails}
              aria-label={`Close ${detail.title} details`}
              autoFocus
            >
              <span aria-hidden="true">×</span>
            </button>
          </header>

          <div className={styles.scrollArea}>
            <p id={descriptionId} className="koinonia-copy">
              {detail.body}
            </p>

            <div className={styles.detailGrid}>
              <section className={styles.detailSection}>
                <h3>What you hand us</h3>
                <ul>
                  {detail.handUs.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>

              <section className={styles.detailSection}>
                <h3>What Koinonia handles</h3>
                <ul>
                  {detail.handles.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>

              <section className={styles.detailSection}>
                <h3>Included in the price</h3>
                <ul>
                  {detail.included.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>

              <section className={styles.detailSection}>
                <h3>What may be separate</h3>
                <ul>
                  {detail.separate.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>

              <section className={styles.detailSection}>
                <h3>What remains with you</h3>
                <ul>
                  {detail.remains.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>

              <section className={`${styles.detailSection} ${styles.example}`}>
                <h3>{detail.exampleTitle}</h3>
                <p>{detail.exampleBody}</p>
              </section>
            </div>
          </div>

          <footer className={styles.footer}>
            <a className="koinonia-button primary" href="/contact#schedule-consultation">
              {detail.ctaLabel}
            </a>
            <button
              type="button"
              className={`koinonia-button secondary ${styles.buttonReset}`}
              onClick={closeDetails}
            >
              Close details
            </button>
          </footer>
        </div>
      </dialog>
    </>
  );
}
