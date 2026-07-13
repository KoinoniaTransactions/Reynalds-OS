export const homeContent = {
  hero: {
    eyebrow: "Real Estate Operations Support",
    title: "Real Estate Operations. Elevated.",
    lead:
      "Koinonia gives Realtors a trusted operations partner for the work behind the client relationship—keeping transactions, contracts, licensed showing coverage, and daily business details organized, responsive, and moving forward.",
    primaryLabel: "Explore Services",
    primaryHref: "/koinonia/services",
    secondaryLabel: "Contact Koinonia",
    secondaryHref: "/koinonia/contact"
  },

  positioning: {
    eyebrow: "Behind-the-Scenes Support",
    title: "Built for the work that keeps real estate moving.",
    lead:
      "Realtors carry the client relationship, negotiations, deadlines, documents, appointments, and follow-through. Koinonia helps organize the operational work behind the scenes so the business keeps moving with clarity and care.",
    highlights: [
      {
        title: "Clearer files",
        body:
          "Documents, deadlines, updates, and next steps stay organized instead of scattered across memory, inboxes, and separate systems."
      },
      {
        title: "Less operational drag",
        body:
          "Koinonia helps absorb the moving parts that compete for a Realtor’s time during active files and busy client seasons."
      },
      {
        title: "Better client momentum",
        body:
          "When details are tracked and communication is supported, Realtors can stay focused on relationships and service."
      }
    ]
  },

  servicesIntro: {
    eyebrow: "Services Built Around Realtor Operations",
    title: "Support built around the way Realtors actually work.",
    lead:
      "From active files to contract preparation, showing conflicts, and daily business organization, Koinonia provides calm, dependable support for the operational work that competes for a Realtor’s time."
  },

  services: [
    {
      title: "Transaction Management",
      body:
        "For Realtors who need timelines, documents, communication, and deadlines organized from contract to close.",
      items: ["Timeline coordination", "Deadline tracking", "Communication support"]
    },
    {
      title: "Contract Preparation & Writing",
      body:
        "For Realtors who need accurate, timely document support without losing focus on clients, negotiations, and next steps.",
      items: ["Offer preparation", "Amendments and addenda", "Signature-ready files"]
    },
    {
      title: "Licensed Showing Coverage",
      body:
        "For moments when your schedule is full, clients need access, and dependable licensed Realtor support matters.",
      items: ["Licensed support", "Access coordination", "Showing feedback"]
    },
    {
      title: "Monthly Operations Partnership",
      body:
        "For growing Realtors who need recurring structure, workflow support, and practical help keeping business details organized between transactions.",
      items: ["Recurring support", "Workflow structure", "Business follow-through"]
    }
  ],

  fit: {
    eyebrow: "Who It Helps",
    title: "For Realtors who need dependable support without adding complexity.",
    lead:
      "Koinonia is designed for real estate professionals who want organized follow-through, practical communication support, and a steady operations partner behind the client-facing work.",
    cards: [
      {
        title: "Busy solo agents",
        body:
          "When your client load grows but you are not ready to build a full internal team, Koinonia helps create structure around the work that keeps slipping."
      },
      {
        title: "Growing Realtor teams",
        body:
          "When multiple people, files, and tasks need coordination, Koinonia helps make the operational work more visible and repeatable."
      },
      {
        title: "Client-focused Realtors",
        body:
          "When you want to stay present with clients instead of buried in details, Koinonia helps keep the behind-the-scenes work moving."
      }
    ]
  },

  experience: {
    eyebrow: "How It Works",
    title: "Simple support. Clear process.",
    lead:
      "The process is intentionally simple: clarify what support is needed, organize the work, and keep the next steps moving.",
    cards: [
      {
        title: "Clarify",
        body:
          "Start with a clear conversation about where support would make the biggest difference."
      },
      {
        title: "Coordinate",
        body:
          "Koinonia organizes the details, deadlines, documents, communication, and next steps."
      },
      {
        title: "Keep Moving",
        body:
          "You stay focused on clients while the operational work stays visible, structured, and moving forward."
      }
    ]
  }
} as const;
