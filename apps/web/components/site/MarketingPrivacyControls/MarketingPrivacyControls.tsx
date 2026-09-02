"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { isPublicMarketingRoute } from "../GoogleAnalytics/GoogleAnalytics";
import {
  browserGlobalPrivacyControlEnabled,
  readMarketingConsentChoice,
  saveMarketingConsentChoice,
  type MarketingConsentChoice
} from "@/lib/marketing-consent";

export function MarketingPrivacyControls() {
  const pathname = usePathname();
  const [choice, setChoice] = useState<MarketingConsentChoice | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [gpcEnabled, setGpcEnabled] = useState(false);

  useEffect(() => {
    if (!isPublicMarketingRoute(pathname)) return;

    const nextChoice = readMarketingConsentChoice();
    setChoice(nextChoice);
    setGpcEnabled(browserGlobalPrivacyControlEnabled());
    setIsOpen(!nextChoice);
  }, [pathname]);

  if (!isPublicMarketingRoute(pathname)) return null;

  function save(analytics: boolean, advertising: boolean) {
    const nextChoice = saveMarketingConsentChoice({ analytics, advertising });
    setChoice(nextChoice);
    setIsOpen(false);
  }

  return (
    <>
      {isOpen ? (
        <section className="koinonia-privacy-panel" aria-label="Privacy choices">
          <div>
            <strong>Privacy choices</strong>
            <p>
              Koinonia can use analytics to understand site performance and, if you allow it,
              advertising technology to measure campaigns and build retargeting audiences.
            </p>
            {gpcEnabled ? (
              <p>
                Your browser is sending a Global Privacy Control signal, so targeted advertising
                remains disabled.
              </p>
            ) : null}
          </div>
          <div className="koinonia-privacy-actions">
            <button className="koinonia-button secondary" type="button" onClick={() => save(false, false)}>
              Essential only
            </button>
            <button className="koinonia-button secondary" type="button" onClick={() => save(true, false)}>
              Allow analytics
            </button>
            <button className="koinonia-button primary" type="button" onClick={() => save(true, true)} disabled={gpcEnabled}>
              Allow analytics & ads
            </button>
          </div>
          <a href="/privacy">Privacy Policy</a>
        </section>
      ) : (
        <button
          className="koinonia-privacy-reopen"
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Review privacy choices"
        >
          Privacy choices
        </button>
      )}
    </>
  );
}
