import { describe, expect, it } from "vitest";
import {
  buildMarketingAttributionSubmission,
  createMarketingTouch,
  migrateLegacyMarketingAttribution,
  updateMarketingAttribution
} from "./marketing-attribution";

function touch(
  search: string,
  capturedAt: string,
  landingPage = `https://www.koinoniatransactions.com/${capturedAt}`,
  referrer = ""
) {
  return createMarketingTouch({ search, referrer, landingPage, capturedAt });
}

describe("Koinonia marketing attribution", () => {
  it("keeps the original first touch while updating the latest attributable touch", () => {
    const first = touch(
      "?utm_source=facebook&utm_medium=organic_social&utm_campaign=evergreen_profile&utm_content=facebook_page_button",
      "2026-09-01T10:00:00.000Z"
    );
    const second = touch(
      "?utm_source=email&utm_medium=warm_followup&utm_campaign=capacity_followup&utm_content=e2_scenario",
      "2026-09-03T10:00:00.000Z"
    );

    const initial = updateMarketingAttribution(null, first);
    const updated = updateMarketingAttribution(initial, second);

    expect(updated.firstTouch).toEqual(first);
    expect(updated.latestTouch).toEqual(second);
  });

  it("does not replace the latest attributable touch during an untagged internal visit", () => {
    const campaignTouch = touch(
      "?utm_source=instagram&utm_medium=organic_social&utm_campaign=launch&utm_content=s1",
      "2026-09-01T10:00:00.000Z"
    );
    const internalVisit = touch(
      "",
      "2026-09-01T10:05:00.000Z",
      "https://www.koinoniatransactions.com/contact",
      "https://www.koinoniatransactions.com/services"
    );

    const updated = updateMarketingAttribution(
      updateMarketingAttribution(null, campaignTouch),
      internalVisit
    );

    expect(internalVisit.referrer).toBe("");
    expect(updated.latestTouch).toEqual(campaignTouch);
  });

  it("uses the latest attributable touch as conversion touch on an untagged form page", () => {
    const first = touch(
      "?utm_source=tiktok&utm_medium=organic_social&utm_campaign=launch&utm_content=t1",
      "2026-09-01T10:00:00.000Z"
    );
    const formPage = touch(
      "",
      "2026-09-01T10:10:00.000Z",
      "https://www.koinoniatransactions.com/contact"
    );

    const submission = buildMarketingAttributionSubmission(
      updateMarketingAttribution(null, first),
      formPage
    );

    expect(submission.firstTouch).toEqual(first);
    expect(submission.latestTouch).toEqual(first);
    expect(submission.conversionTouch).toEqual(first);
  });

  it("uses a newly tagged form visit as the conversion touch without replacing first touch", () => {
    const first = touch(
      "?utm_source=facebook&utm_medium=organic_social&utm_campaign=profile&utm_content=bio",
      "2026-09-01T10:00:00.000Z"
    );
    const conversion = touch(
      "?utm_source=email&utm_medium=personal_outbound&utm_campaign=launch&utm_content=e1_initial_question",
      "2026-09-05T10:00:00.000Z"
    );

    const submission = buildMarketingAttributionSubmission(
      updateMarketingAttribution(null, first),
      conversion
    );

    expect(submission.firstTouch).toEqual(first);
    expect(submission.latestTouch).toEqual(conversion);
    expect(submission.conversionTouch).toEqual(conversion);
  });

  it("migrates the legacy session attribution into first and latest touch", () => {
    const fallback = touch("", "2026-09-01T10:00:00.000Z");
    const migrated = migrateLegacyMarketingAttribution(
      {
        utmSource: "facebook",
        utmMedium: "organic_social",
        utmCampaign: "evergreen_profile",
        utmContent: "facebook_page_button"
      },
      fallback
    );

    expect(migrated?.firstTouch.utmSource).toBe("facebook");
    expect(migrated?.firstTouch.landingPage).toBe(fallback.landingPage);
    expect(migrated?.latestTouch).toEqual(migrated?.firstTouch);
  });
});
