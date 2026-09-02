"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  marketingConsentEventName,
  readMarketingConsentChoice,
  type MarketingConsentChoice
} from "@/lib/marketing-consent";

const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
const isValidMeasurementId = /^G-[A-Z0-9]+$/.test(measurementId ?? "");

const publicMarketingRoutes = new Set([
  "/",
  "/about",
  "/contact",
  "/coverage",
  "/privacy",
  "/referrals",
  "/services"
]);

export function isPublicMarketingRoute(pathname: string | null) {
  return Boolean(pathname && publicMarketingRoutes.has(pathname));
}

export function GoogleAnalytics() {
  const pathname = usePathname();
  const [choice, setChoice] = useState<MarketingConsentChoice | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setChoice(readMarketingConsentChoice());

    function handleConsent(event: Event) {
      const detail = (event as CustomEvent<MarketingConsentChoice>).detail;
      setChoice(detail);
    }

    window.addEventListener(marketingConsentEventName, handleConsent);
    return () => window.removeEventListener(marketingConsentEventName, handleConsent);
  }, []);

  const enabled = Boolean(
    choice?.analytics &&
      measurementId &&
      isValidMeasurementId &&
      isPublicMarketingRoute(pathname)
  );

  useEffect(() => {
    if (!enabled || !isReady || !measurementId || !pathname || typeof window.gtag !== "function") return;

    window.gtag("config", measurementId, {
      page_path: `${pathname}${window.location.search}`,
      page_location: window.location.href,
      send_page_view: true
    });
  }, [enabled, isReady, pathname]);

  if (!enabled || !measurementId) {
    return null;
  }

  return (
    <>
      <Script id="koinonia-google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('js', new Date());
          gtag('consent', 'default', {
            analytics_storage: 'granted',
            ad_storage: 'denied',
            ad_user_data: 'denied',
            ad_personalization: 'denied'
          });
          gtag('config', '${measurementId}', { send_page_view: false });
        `}
      </Script>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
        onReady={() => setIsReady(true)}
      />
    </>
  );
}
