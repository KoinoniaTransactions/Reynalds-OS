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

  servicesIntro: {
    eyebrow: "Real Estate Operations",
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
      title: "Business Operations Support",
      body:
        "For growing Realtors who need structure, workflow support, and practical help keeping daily business details organized.",
      items: ["Workflow support", "Client coordination", "Business organization"]
    }
  ],

  experience: {
    eyebrow: "The Koinonia Experience",
    title: "Simple support. Clear process.",
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
