export const marketingConsentStorageKey = "koinonia_marketing_consent_v1";
export const marketingConsentEventName = "koinonia:marketing-consent";

export type MarketingConsentChoice = {
  version: 1;
  analytics: boolean;
  advertising: boolean;
  updatedAt: string;
  source: "user" | "gpc";
};

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

export function normalizeMarketingConsentChoice(
  input: unknown
): MarketingConsentChoice | null {
  const source = record(input);

  if (source.version !== 1) return null;
  if (typeof source.analytics !== "boolean") return null;
  if (typeof source.advertising !== "boolean") return null;

  return {
    version: 1,
    analytics: source.analytics,
    advertising: source.advertising,
    updatedAt: typeof source.updatedAt === "string" ? source.updatedAt : "",
    source: source.source === "gpc" ? "gpc" : "user"
  };
}

export function browserGlobalPrivacyControlEnabled(): boolean {
  if (typeof navigator === "undefined") return false;

  return Boolean(
    (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl
  );
}

export function enforceGlobalPrivacyControl(
  choice: MarketingConsentChoice | null
): MarketingConsentChoice | null {
  if (!browserGlobalPrivacyControlEnabled()) return choice;

  return {
    version: 1,
    analytics: choice?.analytics ?? false,
    advertising: false,
    updatedAt: choice?.updatedAt || new Date().toISOString(),
    source: "gpc"
  };
}

export function readMarketingConsentChoice(): MarketingConsentChoice | null {
  if (typeof window === "undefined") return null;

  try {
    const stored = normalizeMarketingConsentChoice(
      JSON.parse(window.localStorage.getItem(marketingConsentStorageKey) ?? "null")
    );

    return enforceGlobalPrivacyControl(stored);
  } catch {
    return enforceGlobalPrivacyControl(null);
  }
}

export function saveMarketingConsentChoice({
  analytics,
  advertising
}: {
  analytics: boolean;
  advertising: boolean;
}): MarketingConsentChoice {
  const choice = enforceGlobalPrivacyControl({
    version: 1,
    analytics,
    advertising,
    updatedAt: new Date().toISOString(),
    source: "user"
  }) as MarketingConsentChoice;

  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(marketingConsentStorageKey, JSON.stringify(choice));
    } catch {
      // Privacy preference storage must never block the public site.
    }

    window.dispatchEvent(
      new CustomEvent<MarketingConsentChoice>(marketingConsentEventName, {
        detail: choice
      })
    );
  }

  return choice;
}
