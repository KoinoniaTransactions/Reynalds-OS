"use client";

import { useEffect } from "react";

const storageKey = "koinonia_marketing_attribution";

type MarketingAttribution = {
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  utmContent: string;
  fbclid: string;
  ttclid: string;
  referrer: string;
};

function readCurrentAttribution(): MarketingAttribution {
  const params = new URLSearchParams(window.location.search);

  return {
    utmSource: params.get("utm_source") ?? "",
    utmMedium: params.get("utm_medium") ?? "",
    utmCampaign: params.get("utm_campaign") ?? "",
    utmContent: params.get("utm_content") ?? "",
    fbclid: params.get("fbclid") ?? "",
    ttclid: params.get("ttclid") ?? "",
    referrer: document.referrer ?? ""
  };
}

function hasCampaignSignal(attribution: MarketingAttribution) {
  return Boolean(
    attribution.utmSource ||
      attribution.utmMedium ||
      attribution.utmCampaign ||
      attribution.utmContent ||
      attribution.fbclid ||
      attribution.ttclid
  );
}

export function MarketingAttribution() {
  useEffect(() => {
    const current = readCurrentAttribution();
    const existing = window.sessionStorage.getItem(storageKey);

    if (existing && !hasCampaignSignal(current)) {
      return;
    }

    if (!existing || hasCampaignSignal(current)) {
      window.sessionStorage.setItem(storageKey, JSON.stringify(current));
    }
  }, []);

  return null;
}
