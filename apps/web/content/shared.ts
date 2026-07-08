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
  }
} as const;