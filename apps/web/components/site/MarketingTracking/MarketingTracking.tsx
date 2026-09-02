"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import { captureMarketingAttribution } from "../../../lib/marketingAttribution";

const consentKey = "koinonia-marketing-consent-v1";

type ConsentState = "unknown" | "granted" | "denied";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
    ttq?: { track?: (event: string, payload?: Record<string, unknown>) => void };
    _linkedin_data_partner_ids?: string[];
  }
}

export function trackConsultationLead(details: {
  consultationType: string;
  utmSource?: string;
  utmCampaign?: string;
}) {
  if (typeof window === "undefined") return;

  window.gtag?.("event", "generate_lead", {
    lead_source: details.utmSource ?? "direct",
    campaign: details.utmCampaign ?? "none",
    consultation_type: details.consultationType
  });

  window.fbq?.("track", "Lead");
  window.ttq?.track?.("SubmitForm", {
    content_name: "Koinonia Consultation Request"
  });
}

export function MarketingTracking() {
  const [consent, setConsent] = useState<ConsentState>("unknown");

  const ga4Id = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID;
  const metaPixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const tiktokPixelId = process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID;
  const linkedInPartnerId = process.env.NEXT_PUBLIC_LINKEDIN_PARTNER_ID;

  useEffect(() => {
    captureMarketingAttribution();

    try {
      const stored = window.localStorage.getItem(consentKey);
      if (stored === "granted" || stored === "denied") {
        setConsent(stored);
      }
    } catch {
      setConsent("unknown");
    }
  }, []);

  function choose(next: Exclude<ConsentState, "unknown">) {
    try {
      window.localStorage.setItem(consentKey, next);
    } catch {
      // Consent still applies for this page view if storage is unavailable.
    }
    setConsent(next);
  }

  const trackingEnabled = consent === "granted";

  return (
    <>
      {trackingEnabled && ga4Id ? (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${ga4Id}`}
            strategy="afterInteractive"
          />
          <Script id="koinonia-ga4" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;gtag('js',new Date());gtag('config','${ga4Id}',{send_page_view:true});`}
          </Script>
        </>
      ) : null}

      {trackingEnabled && metaPixelId ? (
        <Script id="koinonia-meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${metaPixelId}');fbq('track','PageView');`}
        </Script>
      ) : null}

      {trackingEnabled && tiktokPixelId ? (
        <Script id="koinonia-tiktok-pixel" strategy="afterInteractive">
          {`!function(w,d,t){w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=['page','track','identify','instances','debug','on','off','once','ready','alias','group','enableCookie','disableCookie'];ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};ttq.load=function(e,n){var i='https://analytics.tiktok.com/i18n/pixel/events.js';ttq._i=ttq._i||{};ttq._i[e]=[];ttq._i[e]._u=i;ttq._t=ttq._t||{};ttq._t[e]=+new Date;ttq._o=ttq._o||{};ttq._o[e]=n||{};var o=document.createElement('script');o.type='text/javascript';o.async=!0;o.src=i+'?sdkid='+e+'&lib='+t;var a=document.getElementsByTagName('script')[0];a.parentNode.insertBefore(o,a)};ttq.load('${tiktokPixelId}');ttq.page();}(window,document,'ttq');`}
        </Script>
      ) : null}

      {trackingEnabled && linkedInPartnerId ? (
        <Script id="koinonia-linkedin-insight" strategy="afterInteractive">
          {`window._linkedin_data_partner_ids=window._linkedin_data_partner_ids||[];window._linkedin_data_partner_ids.push('${linkedInPartnerId}');(function(l){if(!l){window.lintrk=function(a,b){window.lintrk.q.push([a,b])};window.lintrk.q=[]}var s=document.getElementsByTagName('script')[0];var b=document.createElement('script');b.type='text/javascript';b.async=true;b.src='https://snap.licdn.com/li.lms-analytics/insight.min.js';s.parentNode.insertBefore(b,s);})(window.lintrk);`}
        </Script>
      ) : null}

      {consent === "unknown" ? (
        <div
          role="dialog"
          aria-label="Analytics preferences"
          style={{
            position: "fixed",
            left: 16,
            right: 16,
            bottom: 16,
            zIndex: 9999,
            maxWidth: 720,
            margin: "0 auto",
            border: "1px solid #d8c9ad",
            borderRadius: 14,
            padding: 16,
            background: "#fffdf9",
            color: "#181818",
            boxShadow: "0 18px 50px rgba(0,0,0,.18)",
            fontFamily: "inherit"
          }}
        >
          <strong style={{ display: "block", marginBottom: 6 }}>Analytics preferences</strong>
          <span style={{ display: "block", lineHeight: 1.45, marginBottom: 12 }}>
            Koinonia uses optional analytics and advertising measurement to understand which marketing brings Realtors to the site. You can allow or decline that tracking.
          </span>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button className="koinonia-button primary" type="button" onClick={() => choose("granted")}>
              Allow analytics
            </button>
            <button className="koinonia-button secondary" type="button" onClick={() => choose("denied")}>
              Decline
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
