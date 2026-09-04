export const homeContent = {
  hero: {
    eyebrow: "REAL ESTATE OPERATIONS. ELEVATED.",
    title: "You focus on your clients. We'll keep the business running.",
    lead:
      "Koinonia gives Colorado Realtors one white-glove support relationship for the work behind the client experience — transactions, listings, licensed field coverage, marketing, CRM, and recurring business operations.",
    primaryLabel: "Tell Us What You Need",
    primaryHref: "/contact#schedule-consultation",
    secondaryLabel: "See Services & Pricing",
    secondaryHref: "/services#pricing"
  },

  positioning: {
    eyebrow: "ONE RELATIONSHIP. MORE OF YOUR BUSINESS COVERED.",
    title: "More than transaction coordination.",
    lead:
      "Koinonia is built for the operational work that competes with Realtor time. Bring us the file, listing, showing conflict, marketing need, CRM mess, or recurring business task — and we help keep it moving through one support relationship.",
    highlights: [
      {
        title: "Less provider juggling",
        body:
          "Stop rebuilding a support team every time the need changes. Koinonia connects more of the work through one relationship."
      },
      {
        title: "More continuity",
        body:
          "Listing information can flow into marketing, accepted offers can flow into transactions, and follow-up can flow back into your CRM."
      },
      {
        title: "Clear accountability",
        body:
          "Koinonia owns the approved operational work while your professional judgment and client relationship remain with you."
      }
    ]
  },

  servicesIntro: {
    eyebrow: "WHAT KOINONIA CAN HANDLE",
    title: "Five areas of support. One relationship.",
    lead:
      "You do not have to know which service name fits before asking. Start with the work that needs handled and Koinonia helps determine the right path."
  },

  services: [
    {
      title: "Transactions & Contracts",
      body:
        "Keep contract-to-close deadlines, documents, participants, and closing preparation moving with approved document workflow support where permitted.",
      items: ["Transaction management", "Deadlines and documents", "Closing coordination"]
    },
    {
      title: "Listing & Seller Support",
      body:
        "Hand off the operational work around getting a listing ready, getting it live, keeping it organized, and handing it into Transaction Management when an offer is accepted.",
      items: ["Listing launch", "Vendor coordination", "Base listing marketing"]
    },
    {
      title: "Licensed Field Coverage",
      body:
        "Keep approved property and client appointments covered when schedule, distance, or availability gets in the way.",
      items: ["Buyer showings", "Professional open houses", "Property and vendor access"]
    },
    {
      title: "Marketing & Growth",
      body:
        "Keep your brand, listings, database, reviews, referrals, and recurring marketing visible without personally producing and publishing everything yourself.",
      items: ["Social and content", "Email/database marketing", "Online presence"]
    },
    {
      title: "CRM & Business Operations",
      body:
        "Create recurring structure around CRM, follow-up, tasks, vendors, workflows, and business administration so fewer details depend on you personally pushing every next step.",
      items: ["CRM and pipeline", "Follow-up and tasks", "Systems and workflows"]
    }
  ],

  flagship: {
    eyebrow: "A DIFFERENT KIND OF LISTING SUPPORT",
    title: "Win the listing. Then hand us the operational work behind it.",
    lead:
      "Hand Us the Listing gives Realtors a practical way to offload listing intake, vendor and media coordination, launch workflow, base listing marketing, active-listing administration, and accepted-offer handoff — while the Realtor keeps seller strategy, pricing, negotiation, and professional judgment.",
    price: "$350 per standard listing",
    ctaLabel: "See Hand Us the Listing",
    ctaHref: "/services#hand-us-the-listing"
  },

  field: {
    eyebrow: "WHEN YOU CAN'T PHYSICALLY BE THERE",
    title: "Professional field coverage without giving up the client relationship.",
    lead:
      "Koinonia can cover approved buyer showings, professional open houses, inspection/appraisal/media access, and other approved property assignments while you remain the responsible Realtor.",
    price: "From $75 per standard assignment · $200 standard open house",
    ctaLabel: "See Licensed Field Coverage",
    ctaHref: "/services#licensed-field-coverage"
  },

  recurring: {
    eyebrow: "MARKETING + OPERATIONS",
    title: "Need marketing handled — or more of the business behind it?",
    lead:
      "Marketing Management keeps your recurring marketing moving. Koinonia Partnership includes that marketing foundation and adds an agreed layer of CRM and business-operations support.",
    cards: [
      {
        title: "Marketing Management",
        price: "$750/month",
        body:
          "For Realtors who want recurring social, email/database marketing, listing/event integration, reviews/referrals, online presence, and monthly marketing visibility taken off their plate."
      },
      {
        title: "Koinonia Partnership",
        price: "$1,250/month",
        body:
          "For Realtors who want marketing plus recurring CRM, follow-up, task/calendar, vendor, workflow, and business-operations support through one ongoing relationship."
      }
    ]
  },

  pricing: {
    eyebrow: "SIMPLE WAYS TO WORK WITH KOINONIA",
    title: "Clear starting prices without a giant menu of micro-fees.",
    lead:
      "Koinonia prices the managed outcome, not every email, reminder, or routine coordination step.",
    items: [
      { title: "Transaction Management", price: "$450", note: "per successful closing" },
      { title: "Hand Us the Listing", price: "$350", note: "per standard listing" },
      { title: "Licensed Field Coverage", price: "From $75", note: "per standard assignment" },
      { title: "Professional Open House", price: "$200", note: "per standard event" },
      { title: "Marketing Management", price: "$750", note: "per month" },
      { title: "Koinonia Partnership", price: "$1,250", note: "per month" }
    ]
  },

  experience: {
    eyebrow: "HOW IT WORKS",
    title: "Start with the need. Koinonia helps organize the rest.",
    lead:
      "You do not have to diagnose which Koinonia service a task belongs to before reaching out.",
    cards: [
      {
        title: "Tell us what needs handled",
        body:
          "Start with the transaction, listing, field need, marketing workload, CRM problem, recurring business task, or defined project."
      },
      {
        title: "We confirm the path and scope",
        body:
          "Koinonia identifies the right service, required access or approvals, outside costs if any, and what happens next."
      },
      {
        title: "The work keeps moving",
        body:
          "You remain the Realtor while Koinonia coordinates and executes the approved operational work with clear visibility and escalation."
      }
    ]
  }
} as const;
