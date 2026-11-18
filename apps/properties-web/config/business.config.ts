/**
 * Single source for the owner-approved business terms shown across the
 * Properties site. Approved 2026-11-17 / 2026-11-18 — see
 * 02_Companies/Koinonia/04_Departments/Marketing/Properties_Website_Conversion_Research_2026-11-17/
 * files 07, 08 and 10. Change a term here and every page updates.
 */

export const businessHours = {
  label: "Monday–Friday, 8 a.m.–5 p.m. Mountain Time",
  short: "Mon–Fri, 8–5 MT"
} as const;

export const responseStandard = {
  headline: "Next steps within one hour during business hours",
  body:
    "During business hours we reply with next steps within one hour, and we start working on the issue the same or next business day. Emergencies are handled any time through our main line."
} as const;

export const plans = [
  {
    key: "full",
    name: "Managed for You",
    rate: 0.1,
    rateLabel: "10%",
    fits: "Owners who want Koinonia to handle everything, including coordinating vendors and routine maintenance.",
    items: [
      "10% of rent actually collected",
      "Koinonia coordinates vendors and routine repairs",
      "Monthly owner statements and updates"
    ]
  },
  {
    key: "involved",
    name: "Managed With You",
    rate: 0.08,
    rateLabel: "8%",
    fits: "Owners who want to handle eligible, non-urgent maintenance themselves. Koinonia still handles intake, urgency triage and resident communication.",
    items: [
      "8% of rent actually collected",
      "Owner directs eligible non-urgent maintenance",
      "Koinonia oversight, triage and communication"
    ]
  }
] as const;

export const fees = [
  { name: "Monthly management", amount: "10% or 8%", detail: "Of rent actually collected. No fee on rent that isn't collected." },
  { name: "Tenant placement", amount: "50% of one month's rent", detail: "Charged only when a tenant is placed and moves in." },
  { name: "Lease renewal", amount: "$199", detail: "Charged only when a renewal is signed." },
  { name: "Mid-lease inspection", amount: "$99", detail: "Move-in, move-out and initial assessments are included." },
  { name: "Extra owner-requested visits", amount: "$99", detail: "Per visit." },
  { name: "Contractor coordination", amount: "10% of vendor invoice", detail: "Both plans. Itemized on every statement. Not charged when you hire and pay a contractor yourself." },
  { name: "Setup", amount: "$0", detail: "No onboarding or new-owner fee." },
  { name: "Vacancy", amount: "$0", detail: "No monthly fee while the home is vacant." },
  { name: "Ending management", amount: "$0", detail: "No termination penalty." },
  { name: "Major renovations or special projects", amount: "Quoted separately", detail: "Written scope and your approval first." },
  { name: "Rental application (paid by applicant)", amount: "$35", detail: "Limited to the actual cost of screening, as Colorado law requires." }
] as const;

export const included = [
  "Rental analysis and pricing recommendation",
  "Initial property assessment",
  "Listing, advertising and showings",
  "Applicant screening to written criteria",
  "Lease preparation and signing",
  "Move-in and move-out condition inspections",
  "Rent collection",
  "Maintenance intake, triage and 24/7 emergency handling",
  "Monthly owner statements",
  "Security deposit handling under Colorado law"
] as const;

export const repairApproval = {
  routineThreshold: "$250",
  emergencyCap: "$1,000",
  body:
    "Routine repairs over $250 need your approval first. In an emergency we can spend up to $1,000 to protect the home and the resident without waiting, and we tell you right away."
} as const;

export const payout = {
  headline: "Paid on the 10th",
  body:
    "Owner payouts go out on the 10th of each month when rent is paid on time. If rent comes in late, your payout goes out 5 business days after we receive it. Payments are made from cleared funds, and partial payments are paid out as they clear."
} as const;

export const guarantee = {
  headline: "12-month tenant guarantee",
  body:
    "If a tenant we place breaks the lease or is evicted in the first 12 months, we find a new tenant with no placement fee while your home is still under our management. Once per placement.",
  exclusions: [
    "Departures caused by the owner, such as selling the home, ending management, refusing needed repairs or overriding our screening decision",
    "A tenant using a termination right the law gives them",
    "Turnover repairs, legal costs and other costs still apply"
  ]
} as const;

export const referralCredit = {
  body:
    "Refer another owner and, once their home is placed, you receive a credit equal to one month of your management fee. Credits are applied to your account and are not paid in cash."
} as const;

export const maintenanceTiers = [
  {
    name: "Emergency",
    response: "Call back within 1 hour, 24/7",
    examples: ["Fire, gas smell or carbon monoxide (call 911 first)", "Flooding or active leaks", "No heat in cold weather", "Sewage backup", "Home not secure"]
  },
  {
    name: "Urgent",
    response: "Written plan within 24 hours, 7 days a week",
    examples: ["No hot water", "A broken major appliance", "Conditions affecting health or safety that are not an emergency"]
  },
  {
    name: "Routine",
    response: "Next business day",
    examples: ["Dripping faucets", "Minor repairs", "Cosmetic issues"]
  }
] as const;

export const serviceArea = {
  summary:
    "The Front Range corridor from Boulder south to Fountain, east to Aurora, and the major west-side cities.",
  launchCities: ["Castle Rock", "Parker"],
  regions: [
    {
      name: "Douglas County",
      cities: ["Castle Rock", "Parker", "Castle Pines", "Lone Tree", "Highlands Ranch"]
    },
    {
      name: "South and east metro",
      cities: ["Centennial", "Greenwood Village", "Englewood", "Littleton", "Aurora"]
    },
    {
      name: "Denver and west side",
      cities: ["Denver", "Lakewood", "Golden", "Arvada", "Wheat Ridge", "Evergreen"]
    },
    {
      name: "North",
      cities: ["Westminster", "Broomfield", "Boulder"]
    },
    {
      name: "South",
      cities: ["Monument", "Colorado Springs", "Fountain"]
    }
  ],
  later: "Pueblo and Pueblo West are planned for later."
} as const;

export type TeamMember = {
  name: string;
  role: string;
  bio: string;
  focus?: readonly string[];
  /** Path under /public. Leave empty to show initials until a real photo is ready. */
  photo?: string;
  email?: string;
};

/**
 * Add a person by adding one entry. The About page grid grows automatically.
 * Use real photos only; never stock "team" photos.
 */
export const team: readonly TeamMember[] = [
  {
    name: "Jeremiah Reynalds",
    role: "Founder",
    bio:
      "Jeremiah founded Koinonia Properties to give Front Range homeowners a property manager who publishes every fee, answers quickly and treats the people living in the home with care. He works directly with every owner and is the person you reach when you call.",
    focus: ["Owner relationships", "Leasing", "Rent-or-sell planning"]
  }
];

export const agentProgram = {
  leaseFee:
    "A referral fee equal to one month of the management fee, paid to your brokerage after the first month's rent clears.",
  saleChoice:
    "When your client is ready to sell, we tell them in writing that you're ready to help and connect you. Your client always chooses their own agent.",
  saleFallback:
    "If your client chooses Koinonia for the sale instead, your brokerage receives 40% of Koinonia's side of the commission at closing.",
  term: "These protections last 24 months from the date the first lease is signed.",
  agreement:
    "Everything is set out in a written referral and non-circumvention agreement. Referral fees are paid only between licensed brokerages."
} as const;
