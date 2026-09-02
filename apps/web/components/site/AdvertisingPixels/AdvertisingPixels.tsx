"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { isPublicMarketingRoute } from "../GoogleAnalytics/GoogleAnalytics";
import {
  grantAdvertisingTracking,
  revokeAdvertisingTracking,
  trackAdvertisingLead
} from "@/lib/advertising-events";
import {
  marketingConsentEventName,
  readMarketingConsentChoice,
  type MarketingConsentChoice
} from "@/lib/marketing-consent";
import {
  marketingEventName,
  type KoinoniaMarketingEvent
} from "@/lib/google-analytics";

const metaPixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID ?? "";
const tikTokPixelId = process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID ?? "";
const validMetaPixelId = /^\d+$/.test(metaPixelId);
const validTikTokPixelId = /^[A-Z0-9]+$/i.test(tikTokPixelId);

export function AdvertisingPixels() {
  const pathname = usePathname();
  const [choice, setChoice] = useState<MarketingConsentChoice | null>(null);
  const [metaReady, setMetaReady] = useState(false);
  const [tikTokReady, setTikTokReady] = useState(false);

  useEffect(() => {
    setChoice(readMarketingConsentChoice());

    function handleConsent(event: Event) {
      const detail = (event as CustomEvent<MarketingConsentChoice>).detail;
      setChoice(detail);

      if (detail.advertising) {
        grantAdvertisingTracking();
      } else {
        revokeAdvertisingTracking();
      }
    }

    window.addEventListener(marketingConsentEventName, handleConsent);
    return () => window.removeEventListener(marketingConsentEventName, handleConsent);
  }, []);

  useEffect(() => {
    function handleMarketingEvent(event: Event) {
      const detail = (event as CustomEvent<KoinoniaMarketingEvent>).detail;
      if (detail?.eventName !== "generate_lead") return;

      const serviceType =
        typeof detail.parameters?.service_type === "string"
          ? detail.parameters.service_type
          : "Consultation";

      trackAdvertisingLead(serviceType);
    }

    window.addEventListener(marketingEventName, handleMarketingEvent);
    return () => window.removeEventListener(marketingEventName, handleMarketingEvent);
  }, []);

  const enabled = Boolean(choice?.advertising && isPublicMarketingRoute(pathname));

  useEffect(() => {
    if (!enabled || !pathname) return;

    if (metaReady) window.fbq?.("track", "PageView");
    if (tikTokReady) window.ttq?.page?.();
  }, [enabled, metaReady, pathname, tikTokReady]);

  if (!enabled) return null;

  return (
    <>
      {validMetaPixelId ? (
        <>
          <Script id="koinonia-meta-pixel" strategy="afterInteractive">
            {`
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${metaPixelId}');
            `}
          </Script>
          <Script
            id="koinonia-meta-pixel-ready"
            strategy="afterInteractive"
            onReady={() => setMetaReady(true)}
          >{`window.setTimeout(function(){},0);`}</Script>
        </>
      ) : null}

      {validTikTokPixelId ? (
        <Script id="koinonia-tiktok-pixel" strategy="afterInteractive" onReady={() => setTikTokReady(true)}>
          {`
            !function (w, d, t) {
              w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];
              ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"];
              ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};
              for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);
              ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};
              ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;ttq._i=ttq._i||{};ttq._i[e]=[];ttq._i[e]._u=r;ttq._t=ttq._t||{};ttq._t[e]=+new Date;ttq._o=ttq._o||{};ttq._o[e]=n||{};n=document.createElement("script");n.type="text/javascript";n.async=!0;n.src=r+"?sdkid="+e+"&lib="+t;e=document.getElementsByTagName("script")[0];e.parentNode.insertBefore(n,e)};
              ttq.load('${tikTokPixelId}');
            }(window, document, 'ttq');
          `}
        </Script>
      ) : null}
    </>
  );
}
