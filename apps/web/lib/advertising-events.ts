import { readMarketingConsentChoice } from "./marketing-consent";

type MetaPixelFunction = (
  command: "track" | "trackCustom" | "consent",
  eventName: string,
  parameters?: Record<string, string | number | boolean>
) => void;

type TikTokPixel = {
  page?: () => void;
  track?: (
    eventName: string,
    parameters?: Record<string, string | number | boolean>
  ) => void;
  enableCookie?: () => void;
  disableCookie?: () => void;
};

declare global {
  interface Window {
    fbq?: MetaPixelFunction;
    ttq?: TikTokPixel;
  }
}

function advertisingAllowed() {
  return readMarketingConsentChoice()?.advertising === true;
}

export function trackAdvertisingLead(serviceType: string) {
  if (typeof window === "undefined" || !advertisingAllowed()) return;

  window.fbq?.("track", "Lead", {
    content_name: serviceType,
    content_category: "consultation"
  });

  window.ttq?.track?.("Lead", {
    description: serviceType
  });
}

export function revokeAdvertisingTracking() {
  if (typeof window === "undefined") return;

  window.fbq?.("consent", "revoke");
  window.ttq?.disableCookie?.();
}

export function grantAdvertisingTracking() {
  if (typeof window === "undefined") return;

  window.fbq?.("consent", "grant");
  window.ttq?.enableCookie?.();
}
