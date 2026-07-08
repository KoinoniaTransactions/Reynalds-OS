export const servicesContent = {
  hero: {
    eyebrow: "Services & Pricing",
    title: "Support for every stage of your real estate business.",
    lead:
      "Choose the level of operational support that fits the way you work, from transaction management to broader business support."
  },

  categories: {
    eyebrow: "Service Categories",
    title: "Four ways Koinonia supports your business."
  },

  services: [
    {
      title: "Transaction Management",
      body:
        "The operational foundation of Koinonia: contract-to-close support that keeps the file moving.",
      items: ["Deadlines and timeline management", "Communication coordination", "Document and task follow-through"]
    },
    {
      title: "Contract Preparation & Writing",
      body:
        "Support for Realtors who need accurate, professionally prepared contract paperwork.",
      items: ["Offer paperwork", "Amendments and addenda", "Signature-ready document preparation"]
    },
    {
      title: "Licensed Showing Coverage",
      body:
        "Licensed support when scheduling conflicts, distance, or workload make showings difficult to cover.",
      items: ["Licensed property access", "Showing coordination", "Feedback delivery"]
    },
    {
      title: "Business Support",
      body:
        "Flexible operational assistance for the broader needs of a real estate business.",
      items: ["Administrative workflows", "Client communication support", "Business organization"]
    }
  ],

  process: [
    {
      title: "You send the contract.",
      body:
        "Koinonia gathers the details, reviews the file, and starts organizing the transaction."
    },
    {
      title: "You stay focused on your clients.",
      body:
        "While you serve your clients and grow your business, Koinonia tracks deadlines, documents, and communication."
    },
    {
      title: "You close with confidence.",
      body:
        "The file reaches the finish line with organized support every step of the way."
    }
  ],

  supportLevels: [
    {
      title: "Transaction Support",
      body:
        "Best for Realtors who need dependable contract-to-close coordination.",
      items: ["Core transaction management", "Deadline support", "Communication assistance"]
    },
    {
      title: "Expanded Realtor Support",
      body:
        "Best for Realtors who also need help with contract paperwork or additional operational tasks.",
      items: ["Transaction coordination", "Contract preparation support", "Flexible operational help"]
    },
    {
      title: "Operations Partner",
      body:
        "Best for Realtors or teams looking for ongoing business support across multiple needs.",
      items: ["Custom support structure", "Business workflow assistance", "Long-term operational partnership"]
    }
  ]
} as const;