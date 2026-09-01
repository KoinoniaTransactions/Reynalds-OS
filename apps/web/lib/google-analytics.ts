type GoogleAnalyticsEventParameters = Record<string, string | number | boolean>;

declare global {
  interface Window {
    gtag?: (
      command: "event",
      eventName: string,
      parameters?: GoogleAnalyticsEventParameters
    ) => void;
  }
}

export function trackGoogleAnalyticsEvent(
  eventName: string,
  parameters?: GoogleAnalyticsEventParameters
) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") {
    return;
  }

  window.gtag("event", eventName, parameters);
}
