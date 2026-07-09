export const servicesContent = {
  hero: {
    eyebrow: "Services & Pricing",
    title: "Operational support for the work behind the client relationship.",
    lead:
      "Koinonia helps Realtors protect client service by organizing the transactions, contracts, showing conflicts, and business details that compete for their time.",
    primaryLabel: "Schedule a Consultation",
    primaryHref: "/koinonia/contact",
    secondaryLabel: "View Support Levels",
    secondaryHref: "/koinonia/services#support-levels"
  },

  categories: {
    eyebrow: "Service Categories",
    title: "Support for the real work Realtors carry.",
    lead:
      "Each service category is designed to give Realtors structured help with files, paperwork, licensed showing needs, and daily business operations without pulling attention away from clients."
  },

  services: [
    {
      title: "Transaction Management",
      body:
        "Contract-to-close coordination for active files, including timeline setup, deadline tracking, document follow-up, communication support, and closing preparation.",
      items: [
        "Contract-to-close timelines",
        "Deadline and document tracking",
        "Lender, title, and client communication",
        "Closing preparation and file wrap-up"
      ]
    },
    {
      title: "Contract Preparation & Writing",
      body:
        "Licensed document preparation support based on the Realtor’s instructions, with organized drafts, missing-information review, and signature-ready files.",
      items: [
        "Offer preparation support",
        "Amendments and addenda",
        "Required term organization",
        "Draft review before client approval"
      ]
    },
    {
      title: "Licensed Showing Coverage",
      body:
        "Dependable licensed field support when schedules overlap, buyers need access, or distance makes a showing difficult to cover.",
      items: [
        "Licensed property access",
        "Showing appointment coordination",
        "Client instruction review",
        "Feedback and completion updates"
      ]
    },
    {
      title: "Business Operations Support",
      body:
        "Defined operational help for recurring business tasks, client communication, CRM cleanup, workflow documentation, and follow-through.",
      items: [
        "Administrative workflows",
        "Client communication support",
        "CRM and task organization",
        "Process and checklist support"
      ]
    }
  ],

  fit: {
    eyebrow: "Where Support Helps",
    title: "Use Koinonia when the details start competing with client service.",
    lead:
      "The right support depends on what is slowing you down. Koinonia helps create structure around the work that needs to keep moving.",
    cards: [
      {
        title: "Active files need structure",
        body:
          "When deadlines, documents, and communication are spread across too many places, Koinonia helps bring the file back into an organized process."
      },
      {
        title: "Paperwork needs to move quickly",
        body:
          "When an offer, amendment, addendum, or notice needs careful preparation, Koinonia helps organize the required details for review and approval."
      },
      {
        title: "Clients need access",
        body:
          "When your calendar is full or distance creates a conflict, licensed showing coverage helps protect client service and responsiveness."
      },
      {
        title: "Daily operations need follow-through",
        body:
          "When CRM cleanup, task tracking, communication, or workflow details keep slipping, Koinonia helps create visible structure."
      }
    ]
  },

  process: {
    eyebrow: "How It Works",
    title: "A simple process built around the support you need.",
    steps: [
      {
        title: "You share the support need.",
        body:
          "Start with the file, document, showing, or business task that needs dependable operational help."
      },
      {
        title: "Koinonia confirms the scope.",
        body:
          "The request is clarified, boundaries are confirmed, and the next steps are organized before work begins."
      },
      {
        title: "The work is tracked.",
        body:
          "Deadlines, documents, updates, and follow-through are kept visible so the work does not depend on memory."
      },
      {
        title: "You stay focused on clients.",
        body:
          "You remain informed while the operational details keep moving toward completion."
      }
    ]
  },

  supportLevels: {
    eyebrow: "Support Levels",
    title: "Choose the support that fits your business.",
    lead:
      "The conversation stays focused on support first. Pricing supports the decision rather than driving it.",
    levels: [
      {
        title: "Transaction Support",
        body:
          "Best for Realtors who need dependable contract-to-close coordination for active files.",
        items: [
          "Core transaction management",
          "Deadline and document support",
          "Communication assistance"
        ]
      },
      {
        title: "Expanded Realtor Support",
        body:
          "Best for Realtors who also need help with contract paperwork, showing conflicts, or additional operational tasks.",
        items: [
          "Transaction coordination",
          "Contract preparation support",
          "Licensed showing coverage options"
        ]
      },
      {
        title: "Operations Partner",
        body:
          "Best for Realtors or teams looking for ongoing business support across multiple operational needs.",
        items: [
          "Custom support structure",
          "Business workflow assistance",
          "Long-term operational partnership"
        ]
      }
    ]
  }
} as const;
