"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
const isValidMeasurementId = /^G-[A-Z0-9]+$/.test(measurementId ?? "");

const publicMarketingRoutes = new Set([
  "/",
  "/about",
  "/contact",
  "/privacy",
  "/referrals",
  "/services"
]);

export function isPublicMarketingRoute(pathname: string | null) {
  return Boolean(pathname && publicMarketingRoutes.has(pathname));
}

export function GoogleAnalytics() {
  const pathname = usePathname();
  const [isReady, setIsReady] = useState(false);
  const enabled = Boolean(measurementId && isValidMeasurementId && isPublicMarketingRoute(pathname));

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
