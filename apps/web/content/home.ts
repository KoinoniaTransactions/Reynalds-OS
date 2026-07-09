export const homeContent = {
  hero: {
    eyebrow: "Real Estate Operations Support",
    title: "The operational partner behind every successful closing.",
    lead:
      "You focus on your clients. Koinonia helps keep the business running with transaction management, contract preparation, licensed showing coverage, and organized business support for Realtors.",
    primaryLabel: "Explore Services",
    primaryHref: "/koinonia/services",
    secondaryLabel: "Contact Koinonia",
    secondaryHref: "/koinonia/contact"
  },

  servicesIntro: {
    eyebrow: "Real Estate Operations",
    title: "Support built around the way Realtors actually work.",
    lead:
      "From active transactions to after-hours paperwork, showing conflicts, and daily business organization, Koinonia provides calm, dependable support behind the scenes."
  },

  services: [
    {
      title: "Transaction Management",
      body:
        "For Realtors who need timelines, documents, communication, and deadlines kept organized from contract to close.",
      items: ["Timeline coordination", "Deadline tracking", "Communication support"]
    },
    {
      title: "Contract Preparation & Writing",
      body:
        "For Realtors who need accurate, timely document support without losing focus on clients and negotiations.",
      items: ["Offer preparation", "Amendments and addenda", "Signature-ready files"]
    },
    {
      title: "Licensed Showing Coverage",
      body:
        "For moments when your schedule is full, clients need access, and dependable licensed support matters.",
      items: ["Licensed support", "Access coordination", "Showing feedback"]
    },
    {
      title: "Business Operations Support",
      body:
        "For growing Realtors who need more structure, clearer workflows, and organized client support.",
      items: ["Workflow support", "Client coordination", "Business organization"]
    }
  ],

  experience: {
    eyebrow: "The Koinonia Experience",
    title: "Organized, calm, and easy to follow.",
    cards: [
      {
        title: "Connect",
        body:
          "Start with a clear conversation about where support would make the biggest difference."
      },
      {
        title: "Coordinate",
        body:
          "Koinonia organizes the details, deadlines, documents, communication, and next steps."
      },
      {
        title: "Support",
        body:
          "You keep serving clients while the operational work stays visible, structured, and moving."
      }
    ]
  }
} as const;