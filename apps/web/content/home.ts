export const homeContent = {
  hero: {
    eyebrow: "Real Estate Operations Support",
    title: "Real Estate Operations. Elevated.",
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
      "Koinonia brings transaction management, contract preparation, showing coverage, and business operations support into one organized support system."
  },

  services: [
    {
      title: "Transaction Management",
      body:
        "Organized contract-to-close support that keeps timelines, documents, communication, and deadlines moving.",
      items: ["Timeline coordination", "Deadline tracking", "Communication support"]
    },
    {
      title: "Contract Preparation & Writing",
      body:
        "Professional contract paperwork support for Realtors who need accurate, timely document preparation.",
      items: ["Offer preparation", "Amendments and addenda", "Signature-ready files"]
    },
    {
      title: "Licensed Showing Coverage",
      body:
        "Flexible showing support when schedules conflict or additional coverage is needed.",
      items: ["Licensed support", "Access coordination", "Showing feedback"]
    },
    {
      title: "Business Operations Support",
      body:
        "Operational assistance that helps Realtors stay organized beyond a single transaction.",
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
          "Start with a clear conversation about the support your business or transaction needs."
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