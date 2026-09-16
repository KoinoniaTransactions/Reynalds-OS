export const sharedContent = {
  cta: {
    eyebrow: "Start the Conversation",
    title: "Ready for dependable real estate support?",
    body: "When you are ready for organized, responsive support behind the scenes, Koinonia is ready to help.",
    primaryLabel: "Schedule a Consultation",
    primaryHref: "/contact#schedule-consultation",
    secondaryLabel: "Email Koinonia"
  },

  footer: {
    companyName: "Koinonia",
    tagline: "Real estate operations support for Realtors.",
    description:
      "White-glove real estate operations support for Colorado Realtors across transactions, listings, licensed field coverage, marketing, CRM, and recurring business operations.",
    navigationTitle: "Explore",
    contactTitle: "Start the Conversation",
    ctaLabel: "Schedule a Consultation",
    ctaHref: "/contact#schedule-consultation",
    legal: "© Koinonia. All rights reserved.",

    verse: {
      line: "Bear one another’s burdens. Work heartily, as for the Lord.",
      reference: "Galatians 6:2 · Colossians 3:23"
    },

    navigation: [
      { label: "Home", href: "/" },
      { label: "Services", href: "/services" },
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Privacy", href: "/privacy" }
    ]
  },

  trustPillars: {
    eyebrow: "Why Realtors Choose Koinonia",
    title: "A trusted operations partner behind the moving parts.",
    body:
      "Koinonia helps Realtors stay focused on clients while reliable systems, clear communication, and organized support keep transactions, listings, field coverage, marketing, CRM, and recurring business operations moving behind the scenes.",

    pillars: [
      {
        title: "Organized Processes",
        body:
          "Structured workflows help deadlines, documents, communication, and follow-through stay visible instead of depending on memory."
      },
      {
        title: "Proactive Communication",
        body:
          "Clear updates help Realtors, clients, lenders, title teams, and partners understand what is happening and what comes next."
      },
      {
        title: "Dependable Partnership",
        body:
          "Koinonia works as an extension of the Realtor’s business, providing steady support without adding confusion or extra complexity."
      },
      {
        title: "Detail-Driven Execution",
        body:
          "Files, tasks, and client-facing details are handled with consistency, care, and attention to the work that keeps momentum moving."
      }
    ]
  },

  contactActions: {
    cardsLabel: "Koinonia contact methods",
    inlineLabel: "Koinonia contact actions",
    actions: [
      {
        key: "phone",
        eyebrow: "Call",
        title: "Call Koinonia",
        body: "Use phone when a transaction or timeline needs a direct conversation."
      },
      {
        key: "sms",
        eyebrow: "Text",
        title: "Text Koinonia",
        body: "Use SMS for quick questions, scheduling, or time-sensitive coordination."
      },
      {
        key: "email",
        eyebrow: "Email",
        title: "Email Koinonia",
        body: "Use email for new inquiries, transaction details, and organized written context."
      }
    ]
  },

  faq: {
    eyebrow: "Questions",
    title: "Answers that remove uncertainty.",

    items: [
      {
        question: "When should I bring Koinonia into a transaction?",
        answer:
          "As soon as the contract is signed. Early involvement helps deadlines, documents, communication, and next steps get organized from the beginning."
      },
      {
        question: "Can I use only the services I need?",
        answer:
          "Yes. Koinonia is designed around the operational outcome you need, whether that is one transaction, a listing, field coverage, recurring marketing, broader partnership support, or a defined custom project."
      },
      {
        question: "Will I still stay informed?",
        answer:
          "Yes. The goal is not to remove you from the client relationship; it is to keep you supported, informed, and focused on the work that requires your professional judgment."
      },
      {
        question: "How is billing handled?",
        answer:
          "Pricing depends on the service. Transaction Management is billed per successful closing; listing and field services are priced per assignment; recurring Marketing Management and Koinonia Partnership are monthly; and Custom Projects are quoted before work begins. Current pricing is shown on the Services page."
      }
    ]
  }
} as const;
