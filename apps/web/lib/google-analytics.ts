type GoogleAnalyticsEventParameters = Record<string, string | number | boolean>;

type GoogleAnalyticsConsentParameters = {
  analytics_storage?: "granted" | "denied";
  ad_storage?: "granted" | "denied";
  ad_user_data?: "granted" | "denied";
  ad_personalization?: "granted" | "denied";
};

type GoogleAnalyticsFunction = {
  (
    command: "event",
    eventName: string,
    parameters?: GoogleAnalyticsEventParameters
  ): void;
  (
    command: "config",
    measurementId: string,
    parameters?: GoogleAnalyticsEventParameters
  ): void;
  (
    command: "consent",
    action: "default" | "update",
    parameters: GoogleAnalyticsConsentParameters
  ): void;
};

declare global {
  interface Window {
    gtag?: GoogleAnalyticsFunction;
  }
}

export const marketingEventName = "koinonia:marketing-event";

export type KoinoniaMarketingEvent = {
  eventName: string;
  parameters?: GoogleAnalyticsEventParameters;
};

export function trackGoogleAnalyticsEvent(
  eventName: string,
  parameters?: GoogleAnalyticsEventParameters
) {
  if (typeof window === "undefined") return;

  window.dispatchEvent(
    new CustomEvent<KoinoniaMarketingEvent>(marketingEventName, {
      detail: { eventName, parameters }
    })
  );

  if (typeof window.gtag !== "function") return;
  window.gtag("event", eventName, parameters);
}
