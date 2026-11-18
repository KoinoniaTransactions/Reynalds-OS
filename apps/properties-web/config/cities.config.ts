/**
 * Launch city pages. Each city must have genuine local content (no copied
 * text between cities). Add a city here, then add its route folder under
 * app/property-management/<slug>/ and register the path in seo.config.ts.
 * Re-check sourced figures before each quarterly update.
 */

export type CityContent = {
  slug: string;
  name: string;
  county: string;
  intro: string;
  neighborhoods: readonly { name: string; note: string }[];
  market: readonly { label: string; value: string; source?: { name: string; url: string } }[];
  rules: readonly { title: string; body: string; source?: { name: string; url: string } }[];
  faqs: readonly { q: string; a: string }[];
  nearby: readonly string[];
};

export const cities: Record<string, CityContent> = {
  "castle-rock": {
    slug: "castle-rock",
    name: "Castle Rock",
    county: "Douglas County",
    intro:
      "Castle Rock sits on I-25 between Denver and Colorado Springs, which makes it a natural fit for renters who commute in either direction. Most rentals here are single-family homes in HOA communities, so leasing well means knowing both the market and the neighborhood rules.",
    neighborhoods: [
      { name: "The Meadows", note: "Large master-planned community with parks, trails and its own HOA rules for rentals and parking." },
      { name: "Crystal Valley Ranch", note: "Newer homes on the south side of town, popular with families who want space and quick I-25 access." },
      { name: "Terrain", note: "Newer community on the east side with trails and open space; review HOA leasing rules before listing." },
      { name: "Downtown Castle Rock", note: "Older homes close to downtown shops and Festival Park, attractive to renters who want walkability." }
    ],
    market: [
      {
        label: "Median sold price",
        value: "About $715,000",
        source: { name: "Realtor.com, Castle Rock market", url: "https://www.realtor.com/local/market/colorado/douglas-county/castle-rock" }
      },
      {
        label: "Median days to sell",
        value: "About 57 days",
        source: { name: "Realtor.com, Castle Rock market", url: "https://www.realtor.com/local/market/colorado/douglas-county/castle-rock" }
      },
      { label: "What your home will rent for", value: "Get an estimate for your address on our rental analysis page" }
    ],
    rules: [
      {
        title: "No town rental license for long-term rentals",
        body: "The Town of Castle Rock does not run a rental license or inspection program for rentals of 30 days or more."
      },
      {
        title: "Short-term rentals need a business license and taxes",
        body: "The Town does not issue short-term rental permits, but every short-term rental needs a Town business license and must collect sales and lodging tax.",
        source: { name: "Town of Castle Rock FAQ", url: "https://www.crgov.com/FAQ.aspx?QID=782" }
      },
      {
        title: "HOA rules come first",
        body: "Many Castle Rock communities have HOA rules on lease length, parking, trash and exterior changes. We review your HOA documents before listing and give tenants the rules with the lease."
      }
    ],
    faqs: [
      {
        q: "Do I need a rental license to rent my Castle Rock home?",
        a: "Not from the Town for long-term rentals of 30 days or more. Your HOA may still have leasing rules, which we review before listing."
      },
      {
        q: "My Castle Rock home has been on the market a while. Should I rent it instead?",
        a: "It can make sense if rent covers most of your payment and you want to wait for a better time to sell. Use our home-not-selling calculator or ask us to run the numbers for your address. We'll work with your listing agent."
      },
      {
        q: "How much does property management cost in Castle Rock?",
        a: "Koinonia charges 10% of rent collected for full service or 8% if you handle eligible routine maintenance yourself, plus 50% of one month's rent when a tenant is placed. There are no setup, vacancy or termination fees."
      },
      {
        q: "How quickly do you respond to Castle Rock owners and residents?",
        a: "During business hours (Monday–Friday, 8–5 Mountain) we reply with next steps within one hour. Emergencies are handled any time."
      }
    ],
    nearby: ["Castle Pines", "Parker", "Lone Tree", "Monument"]
  },
  parker: {
    slug: "parker",
    name: "Parker",
    county: "Douglas County",
    intro:
      "Parker draws renters who want good schools, trails and a small-town Mainstreet within reach of the Denver Tech Center along E-470 and Parker Road. Townhomes and single-family homes lease well here when they are priced right and presented well.",
    neighborhoods: [
      { name: "The Pinery", note: "One of Parker's oldest neighborhoods, with larger lots and mature pines. Renters here often stay longer." },
      { name: "Stonegate and Canterberry Crossing", note: "Established family neighborhoods near schools, parks and the trail system." },
      { name: "Historic Mainstreet area", note: "Walkable to restaurants, O'Brien Park and community events, which renters will pay more for." },
      { name: "Newer communities to the south and east", note: "Newer construction with open floor plans; HOA rules on leasing vary, so we check before listing." }
    ],
    market: [
      {
        label: "3-bedroom median rent",
        value: "About $2,800 (typical $2,425–$3,200)",
        source: { name: "TurboTenant, Parker listings 2023–2026", url: "https://www.turbotenant.com/property-management/services/colorado/parker/" }
      },
      {
        label: "Single-family home median rent",
        value: "About $2,700",
        source: { name: "TurboTenant, Parker listings 2023–2026", url: "https://www.turbotenant.com/property-management/services/colorado/parker/" }
      },
      {
        label: "Townhouse median rent",
        value: "About $2,925",
        source: { name: "TurboTenant, Parker listings 2023–2026", url: "https://www.turbotenant.com/property-management/services/colorado/parker/" }
      }
    ],
    rules: [
      {
        title: "No town rental license",
        body: "Parker does not require a rental license, but a Town business and tax license may apply.",
        source: { name: "TurboTenant, citing Parker Mun. Code § 4.03.050", url: "https://www.turbotenant.com/property-management/services/colorado/parker/" }
      },
      {
        title: "HOA leasing rules",
        body: "Many Parker neighborhoods have HOAs that can set lease minimums, tenant registration or limits on rentals. We review the rules before listing."
      },
      {
        title: "Winter-ready homes",
        body: "Freezing nights mean sprinkler blowouts, furnace service and pipe protection belong on every Parker rental's calendar. We schedule them."
      }
    ],
    faqs: [
      {
        q: "Do I need a rental license in Parker?",
        a: "No rental license is required, but a Town business and tax license may apply. Your HOA may also have leasing rules."
      },
      {
        q: "What will my Parker home rent for?",
        a: "Recent Parker listings put the median 3-bedroom rent around $2,800, but your home's size, condition and neighborhood matter. Request a free rental analysis for an estimate on your address."
      },
      {
        q: "How much does property management cost in Parker?",
        a: "Koinonia charges 10% of rent collected for full service or 8% if you handle eligible routine maintenance yourself, plus 50% of one month's rent when a tenant is placed. There are no setup, vacancy or termination fees."
      },
      {
        q: "Can you work with my listing agent if my Parker home isn't selling?",
        a: "Yes. We'll pay your agent's brokerage a referral fee if you lease with us, and when you're ready to sell, we'll steer you back to them."
      }
    ],
    nearby: ["Castle Rock", "Lone Tree", "Centennial", "Aurora"]
  }
};
