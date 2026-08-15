export const contactContent = {
  hero: {
    eyebrow: "Contact Koinonia",
    title: "Start with a clear next step.",
    lead:
      "Reach out when you need dependable real estate operations support as a Colorado Realtor for a transaction, contract, showing conflict, monthly business support, or a referral opportunity. Koinonia will help clarify the need and identify the right path forward.",
    primaryLabel: "Schedule a Consultation",
    primaryHref: "/contact#schedule-consultation",
    secondaryLabel: "View Services",
    secondaryHref: "/services"
  },

  reachOut: {
    eyebrow: "How to Reach Out",
    title: "Choose the easiest way to start.",
    lead:
      "Email, call, or text with a short summary of the support or referral need. If there is an active deadline, contract date, showing need, monthly support question, or buyer/seller opportunity, include that context so the first response can be useful.",
    noteTitle: "Helpful details to include",
    noteItems: [
      "The type of support or referral need",
      "Whether this is for an active transaction, document, showing, monthly support, or buyer/seller referral",
      "Any active deadline or timing concern",
      "The best way to respond",
      "Any documents or context that would help clarify the request"
    ]
  },

  scheduleConsultation: {
    eyebrow: "Schedule a Consultation",
    title: "Need help choosing the right support?",
    lead:
      "Open the scheduler, choose the support or referral path that fits your need, and request a weekday consultation time.",
    availabilityLabel: "Availability",
    availability: "Monday–Friday · 9:00 AM–5:00 PM",
    buttonLabel: "Open Scheduler",
    selectorLabel: "What do you need help with?",
    selectorHelper:
      "Choose the path that best fits your need before sending your consultation request.",
    cards: [
      {
        title: "Transaction Support",
        body: "For active or upcoming contract-to-close support.",
        bestWhen:
          "Best when you already have a signed contract, accepted offer, or file that needs deadline and communication support.",
        subject: "Koinonia Transaction Support Consultation Request"
      },
      {
        title: "Contract & Document Support",
        body: "For offers, amendments, addenda, notices, or paperwork help.",
        bestWhen:
          "Best when you know what needs to be prepared and want licensed document support based on your instructions.",
        subject: "Koinonia Contract and Document Support Consultation Request"
      },
      {
        title: "Licensed Showing Coverage",
        body: "For scheduling conflicts, distance issues, or buyer showing needs.",
        bestWhen:
          "Best when you need a licensed agent to help with access, showing coverage, or buyer follow-up.",
        subject: "Koinonia Licensed Showing Coverage Consultation Request"
      },
      {
        title: "Monthly Operations Partnership",
        body: "For recurring admin, CRM, follow-up, task cleanup, and backend business support.",
        bestWhen:
          "Best when you need ongoing operational help, not just one transaction or one document.",
        subject: "Koinonia Monthly Operations Partnership Consultation Request"
      },
      {
        title: "40% Referral Partner Option",
        body: "For a buyer or seller opportunity you would rather refer than personally service.",
        bestWhen:
          "Best when workload, timing, financing readiness, geography, nurture requirements, or fit make a formal brokerage referral more useful than keeping the client relationship yourself.",
        subject: "Koinonia 40% Referral Partner Inquiry"
      },
      {
        title: "Not Sure Yet",
        body: "For Realtors who know they need help but are not sure where to start.",
        bestWhen:
          "Best when you want a quick conversation to choose the right support or referral path.",
        subject: "Koinonia General Consultation Request"
      }
    ]
  },

  supportOptions: {
    eyebrow: "Support Intake",
    title: "What kind of support are you asking about?",
    lead:
      "You do not need to know the perfect category before reaching out. These four paths cover Koinonia Transactions operational support.",
    cards: [
      {
        title: "Transaction Support",
        body:
          "For active contract-to-close files that need timeline setup, deadline tracking, document follow-up, communication support, or closing preparation."
      },
      {
        title: "Contract & Document Support",
        body:
          "For offers, amendments, addenda, notices, or other document preparation support based on Realtor instructions."
      },
      {
        title: "Licensed Showing Coverage",
        body:
          "For schedule conflicts, distance challenges, or licensed access needs when a showing still needs to be covered."
      },
      {
        title: "Monthly Operations Partnership",
        body:
          "For ongoing real estate operations support, CRM organization, task tracking, client follow-up, workflow structure, and recurring business follow-through."
      }
    ]
  },

  referralDiscovery: {
    eyebrow: "Referral Partner Path",
    title: "Don't want to keep the client relationship?",
    lead:
      "If the real issue is that you do not want to personally carry the buyer or seller opportunity, Koinonia also offers a separate 40% Referral Partner Option for qualifying successfully closed referred business.",
    body:
      "This is separate from Koinonia Transactions services and uses a documented brokerage referral process.",
    label: "Learn About the 40% Referral Option",
    href: "/referrals"
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
          "Start with the type of support or referral path that best matches the situation."
      },
      {
        title: "Koinonia clarifies the fit",
        body:
          "The request is reviewed, the right support or referral path is identified, and any missing details are confirmed before work or a client handoff begins."
      },
      {
        title: "You get a clear next step",
        body:
          "The conversation turns into an organized plan for support, referral documentation when applicable, communication, timing, and follow-through."
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
          "Share the type of support or referral need, whether there is an active deadline, the best way to contact you, and any important context that would help Koinonia understand the request."
      },
      {
        question: "Can I ask about more than one service?",
        answer:
          "Yes. Many Realtors need a mix of transaction support, contract and document support, licensed showing coverage, or monthly operations support. The first conversation can clarify what fits."
      },
      {
        question: "Can I ask about the referral option instead of a Koinonia service?",
        answer:
          "Yes. If you have a buyer or seller opportunity you would rather refer than personally service, choose the 40% Referral Partner Option in the consultation selector."
      },
      {
        question: "Is reaching out a commitment?",
        answer:
          "No. The first step is simply a conversation to understand your needs and determine the appropriate support or referral path."
      },
      {
        question: "Can I ask about monthly support even if I am not ready to choose a tier?",
        answer:
          "Yes. Monthly support can begin with a conversation about what is currently slipping, what systems need structure, and what level of recurring support would be useful."
      }
    ]
  }
} as const;
