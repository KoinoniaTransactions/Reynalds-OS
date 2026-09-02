"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { isPublicMarketingRoute } from "../GoogleAnalytics/GoogleAnalytics";
import {
  createMarketingTouch,
  legacyMarketingAttributionStorageKey,
  marketingAttributionStorageKey,
  migrateLegacyMarketingAttribution,
  normalizeMarketingAttributionState,
  previousMarketingAttributionStorageKey,
  updateMarketingAttribution
} from "@/lib/marketing-attribution";

export function MarketingAttribution() {
  const pathname = usePathname();

  useEffect(() => {
    if (!isPublicMarketingRoute(pathname)) return;

    const current = createMarketingTouch({
      search: window.location.search,
      referrer: document.referrer ?? "",
      landingPage: window.location.href,
      capturedAt: new Date().toISOString()
    });

    let existing = null;

    try {
      existing = normalizeMarketingAttributionState(
        JSON.parse(window.localStorage.getItem(marketingAttributionStorageKey) ?? "null")
      );

      if (!existing) {
        existing = normalizeMarketingAttributionState(
          JSON.parse(window.localStorage.getItem(previousMarketingAttributionStorageKey) ?? "null")
        );
      }

      if (!existing) {
        existing = migrateLegacyMarketingAttribution(
          JSON.parse(window.sessionStorage.getItem(legacyMarketingAttributionStorageKey) ?? "null"),
          current
        );
      }

      window.localStorage.setItem(
        marketingAttributionStorageKey,
        JSON.stringify(updateMarketingAttribution(existing, current))
      );
    } catch {
      // Attribution must never block the public site or consultation flow.
    }
  }, [pathname]);

  return null;
}
