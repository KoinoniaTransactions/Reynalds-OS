export const sharedContent = {
  cta: {
    eyebrow: "Start the Conversation",
    title: "Ready to simplify your next transaction?",
    body: "When you are ready for organized, dependable real estate support, Koinonia is ready to help.",
    primaryLabel: "Schedule a Consultation",
    primaryHref: "/koinonia/contact",
    secondaryLabel: "Email Koinonia"
  },

  footer: {
    companyName: "Koinonia",
    tagline: "Real estate operations support for Realtors.",

    navigation: [
      { label: "Home", href: "/koinonia" },
      { label: "Services", href: "/koinonia/services" },
      { label: "About", href: "/koinonia/about" },
      { label: "Contact", href: "/koinonia/contact" }
    ]
  },

  trustPillars: {
    eyebrow: "Why Realtors Choose Koinonia",
    title: "A trusted partner behind every successful transaction.",
    body:
      "Koinonia helps Realtors stay focused on clients while reliable systems, clear communication, and organized support keep the work moving behind the scenes.",

    pillars: [
      {
        title: "Organized Processes",
        body:
          "Structured workflows keep deadlines, documents, communication, and follow-through from depending on memory."
      },
      {
        title: "Proactive Communication",
        body:
          "Clear updates help Realtors, clients, lenders, title teams, and partners understand what is happening next."
      },
      {
        title: "Dependable Partnership",
        body:
          "Koinonia works as an extension of the Realtor's business, not as a disconnected vendor."
      },
      {
        title: "Detail-Driven Execution",
        body:
          "Files are handled with consistency, care, and attention to the details that keep transactions moving."
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
          "Yes. Koinonia is designed around support levels and operational needs, not one-size-fits-all packages."
      },
      {
        question: "Will I still stay informed?",
        answer:
          "Yes. The goal is not to remove you from the transaction; it is to keep you supported, informed, and focused on your clients."
      },
      {
        question: "How is billing handled?",
        answer:
          "Koinonia supports both prepaid and pay-at-close models depending on the service level and agreement."
      }
    ]
  }
} as const;