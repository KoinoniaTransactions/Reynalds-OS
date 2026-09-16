export const contactContent = {
  hero: {
    eyebrow: "Contact Koinonia",
    title: "Start with a clear next step.",
    lead:
      "Reach out when you need dependable real estate operations support as a Colorado Realtor for a transaction, contract, showing conflict, or monthly business support. Koinonia will help clarify the need and identify the right path forward.",
    primaryLabel: "Schedule a Consultation",
    primaryHref: "/contact#schedule-consultation",
    secondaryLabel: "View Services",
    secondaryHref: "/services"
  },

  reachOut: {
    eyebrow: "How to Reach Out",
    title: "Choose the easiest way to start.",
    lead:
      "Email, call, or text with a short summary of the support you need. If there is an active deadline, contract date, showing need, or monthly support question, include that context so the first response can be useful.",
    noteTitle: "Helpful details to include",
    noteItems: [
      "The type of support you need",
      "Whether this is for an active transaction, document, showing, or monthly support",
      "Any active deadline or timing concern",
      "The best way to respond",
      "Any documents or context that would help clarify the request"
    ]
  },

  scheduleConsultation: {
    eyebrow: "Schedule a Consultation",
    title: "Need help choosing the right support?",
    lead:
      "Open the scheduler, choose the support type that fits your need, and request a weekday consultation time.",
    availabilityLabel: "Availability",
    availability: "Monday–Friday · 9:00 AM–5:00 PM",
    buttonLabel: "Open Scheduler",
    selectorLabel: "What do you need help with?",
    selectorHelper:
      "Choose the support type that fits your need before sending your consultation request.",
    cards: [
      {
        id: "transaction-management",
        title: "Transaction Management",
        body: "For active or upcoming contract-to-close support.",
        bestWhen:
          "Best when you already have a signed contract, accepted offer, or file that needs deadline, document, and communication support.",
        subject: "Koinonia Transaction Management Consultation Request"
      },
      {
        id: "hand-us-the-listing",
        title: "Hand Us the Listing",
        body: "For operational support around preparing, launching, and managing a listing.",
        bestWhen:
          "Best when you have a listing to launch and want the normal coordination, listing-live workflow, base marketing, and accepted-offer handoff organized for you.",
        subject: "Koinonia Hand Us the Listing Consultation Request"
      },
      {
        id: "licensed-field-coverage",
        title: "Licensed Field Coverage",
        body: "For buyer showings, open houses, property access, and approved in-person assignments.",
        bestWhen:
          "Best when schedule, distance, or availability makes it difficult for you to be physically present for an approved property or client need.",
        subject: "Koinonia Licensed Field Coverage Consultation Request"
      },
      {
        id: "contract-document-support",
        title: "Contract & Document Support",
        body: "For offers, amendments, addenda, notices, or paperwork help.",
        bestWhen:
          "Best when you know what needs to be prepared and want licensed document support based on your instructions.",
        subject: "Koinonia Contract and Document Support Consultation Request"
      },
      {
        id: "marketing-management",
        title: "Marketing Management",
        body: "For recurring real-estate marketing that you want taken off your plate.",
        bestWhen:
          "Best when you want recurring social, email/database marketing, listing and event integration, reviews, referrals, online presence, and reporting managed consistently.",
        subject: "Koinonia Marketing Management Consultation Request"
      },
      {
        id: "koinonia-partnership",
        title: "Koinonia Partnership",
        body: "For marketing plus recurring CRM and business-operations support.",
        bestWhen:
          "Best when you want one ongoing relationship to help manage both recurring marketing and an agreed layer of CRM, follow-up, task, vendor, workflow, and operations support.",
        subject: "Koinonia Partnership Consultation Request"
      },
      {
        id: "custom-projects",
        title: "Custom Project",
        body: "For a defined operational or marketing project that does not fit a standard service.",
        bestWhen:
          "Best when you have a specific outcome such as CRM cleanup, database reactivation, workflow/SOP development, campaign work, or another approved project.",
        subject: "Koinonia Custom Project Consultation Request"
      },
      {
        id: "not-sure-yet",
        title: "Not Sure Yet",
        body: "For Realtors who know they need help but are not sure where to start.",
        bestWhen:
          "Best when you want a quick conversation to choose the right support path.",
        subject: "Koinonia General Consultation Request"
      }
    ]
  },

  supportOptions: {
    eyebrow: "Support Intake",
    title: "What kind of support are you asking about?",
    lead:
      "You do not need to know the perfect category before reaching out. These paths simply help start the conversation with the right context.",
    cards: [
      {
        title: "Transaction & Listing Support",
        body:
          "For active contract-to-close files or listings that need organized coordination, follow-through, launch support, or accepted-offer handoff."
      },
      {
        title: "Contract & Document Support",
        body:
          "For offers, amendments, addenda, notices, or other document preparation support based on Realtor instructions."
      },
      {
        title: "Licensed Field Coverage",
        body:
          "For buyer showings, professional open houses, property access, or other approved licensed field assignments."
      },
      {
        title: "Marketing & Business Operations",
        body:
          "For recurring marketing, CRM organization, follow-up, task tracking, workflow structure, and broader ongoing business support."
      }
    ]
  },

  nextSteps: {
    eyebrow: "What Happens Next",
    title: "A simple intake process with organized follow-through.",
    lead:
      "The first conversation should feel calm, professional, and practical. Koinonia will help turn the request into clear next steps.",
    cards: [
      {
        title: "You choose the consultation need",
        body:
          "Start with the type of support that best matches the transaction, listing, document, field coverage, marketing, operations, project, or general question."
      },
      {
        title: "Koinonia clarifies the fit",
        body:
          "The request is reviewed, the right support path is identified, and any missing details are confirmed before work begins."
      },
      {
        title: "You get a clear next step",
        body:
          "The conversation turns into an organized plan for support, communication, timing, consultation scheduling, and follow-through."
      }
    ]
  },

  faq: {
    eyebrow: "Contact FAQ",
    title: "Questions before you reach out.",
    items: [
      {
        question: "What should I include when I reach out?",
        answer:
          "Share the type of support you need, whether there is an active deadline, the best way to contact you, and any important context that would help Koinonia understand the request."
      },
      {
        question: "Can I ask about more than one service?",
        answer:
          "Yes. Many Realtors need a mix of transaction, listing, document, field, marketing, or recurring business support. The first conversation can clarify what fits."
      },
      {
        question: "Is reaching out a commitment?",
        answer:
          "No. The first step is simply a conversation to understand your needs and determine whether Koinonia is the right support partner."
      },
      {
        question: "Can I ask about monthly support if I am not sure which option fits?",
        answer:
          "Yes. The consultation can help distinguish Marketing Management from the broader Koinonia Partnership based on what you want taken off your plate."
      }
    ]
  }
} as const;
