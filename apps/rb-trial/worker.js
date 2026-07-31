const jobs = [
  {
    name: "WM 6958 - ACC UCO Tank Completion",
    store: "6958",
    city: "Cameron",
    state: "NC",
    phase: "Completion Review",
    health: "Healthy",
    crew: "Trey Turner",
    invoice: "Review",
    emails: 1,
    wo: "GMAIL-19faf007bfe01e01",
    next: "Review completion PDF and confirm invoice readiness.",
    communications: ["Jotform completion packet with signature and completed level 2 triage PDF."]
  },
  {
    name: "WM 3347 - ServiceChannel Note",
    store: "3347",
    city: "Winter Haven",
    state: "FL",
    phase: "Note Review",
    health: "Attention",
    crew: "Unassigned",
    invoice: "Not Ready",
    emails: 1,
    wo: "349228841",
    next: "Read latest ServiceChannel note for WO 349228841.",
    communications: ["ServiceChannel note matched by store, city/state, sender, and work order."]
  },
  {
    name: "WM 1087 - Stuart ACC UCO Tank Work",
    store: "1087",
    city: "Stuart",
    state: "FL",
    phase: "Documentation Reconciliation",
    health: "Attention",
    crew: "Trey Turner",
    invoice: "Review",
    emails: 3,
    wo: "357811854",
    next: "Reconcile ServiceChannel note, triage lock, and completion paperwork.",
    communications: [
      "ServiceChannel note matched to WO 357811854.",
      "Jotform completion packet matched by store and city.",
      "Tank triage lock matched by subject and store."
    ]
  },
  {
    name: "WM 773 - ServiceChannel Note",
    store: "773",
    city: "Eunice",
    state: "LA",
    phase: "Note Review",
    health: "Attention",
    crew: "Unassigned",
    invoice: "Not Ready",
    emails: 1,
    wo: "354598199",
    next: "Read latest ServiceChannel note for WO 354598199.",
    communications: ["ServiceChannel note matched by store, city/state, sender, and work order."]
  },
  {
    name: "WM 3595 - Fayetteville ACC UCO Tank Work",
    store: "3595",
    city: "Fayetteville",
    state: "NC",
    phase: "Completion Review",
    health: "Healthy",
    crew: "Trey Turner",
    invoice: "Review",
    emails: 2,
    wo: "GMAIL-WM-3595",
    next: "Review triage lock and completion paperwork together.",
    communications: ["Tank triage lock and Jotform completion packet filed to the same card."]
  },
  {
    name: "WM 2929 - Hope Mills ACC UCO Tank Work",
    store: "2929",
    city: "Hope Mills",
    state: "NC",
    phase: "Completion Review",
    health: "Healthy",
    crew: "Trey Turner",
    invoice: "Review",
    emails: 2,
    wo: "GMAIL-WM-2929",
    next: "Review triage lock and completion paperwork together.",
    communications: ["Tank triage lock and Jotform completion packet filed to the same card."]
  },
  {
    name: "WM 920 - Warner Robins UCO Work Completion",
    store: "920",
    city: "Warner Robins",
    state: "GA",
    phase: "Completion Review",
    health: "Healthy",
    crew: "Austin Wright",
    invoice: "Review",
    emails: 1,
    wo: "GMAIL-WM-920",
    next: "Review completion PDF and date fields before invoice readiness.",
    communications: ["Jotform UCO completion packet filed by store, city/state, and sender."]
  },
  {
    name: "WM 649 - Titusville ACC UCO Tank Work",
    store: "649",
    city: "Titusville",
    state: "FL",
    phase: "Completion Review",
    health: "Healthy",
    crew: "Trey Turner",
    invoice: "Review",
    emails: 2,
    wo: "GMAIL-WM-649",
    next: "Review triage lock and completion paperwork together.",
    communications: ["Tank triage lock and Jotform completion packet filed to the same card."]
  },
  {
    name: "WM 3402 - Stockbridge ACC UCO Tank Work",
    store: "3402",
    city: "Stockbridge",
    state: "GA",
    phase: "Completion Review",
    health: "Healthy",
    crew: "Austin Wright",
    invoice: "Review",
    emails: 2,
    wo: "GMAIL-WM-3402",
    next: "Review triage lock and completion paperwork together.",
    communications: ["Tank triage lock and Jotform completion packet filed to the same card."]
  },
  {
    name: "NHM 4426 - Columbus Project Release",
    store: "4426",
    city: "Columbus",
    state: "GA",
    phase: "Released for Production",
    health: "Healthy",
    crew: "John Nester",
    invoice: "Not Ready",
    emails: 1,
    wo: "GMAIL-NHM-4426",
    next: "Confirm production scheduling after project release.",
    communications: ["Project release email filed by NHM store number, city/state, subject, and sender."]
  },
  {
    name: "WM 1068 - Sebastian ACC Tank Replacement",
    store: "1068",
    city: "Sebastian",
    state: "FL",
    phase: "Workflow Updated",
    health: "Attention",
    crew: "Unassigned",
    invoice: "Not Ready",
    emails: 1,
    wo: "1068.1017",
    next: "Review uploaded LxRetail pre-construction permit documents.",
    communications: ["LxRetail workflow update matched by store, WO, city/state, subject, and sender."]
  },
  {
    name: "WM 2214 - Columbia Permit Coordination",
    store: "2214",
    city: "Columbia",
    state: "SC",
    phase: "Permit Coordination",
    health: "Attention",
    crew: "Skip Zabel",
    invoice: "Not Ready",
    emails: 1,
    wo: "GMAIL-WM-2214",
    next: "Confirm permitting requirements for the 105-gallon used motor oil tank install.",
    communications: ["Permit coordination email matched by store number, address/city clue, sender, and attachment name."]
  },
  {
    name: "WM 5480 - Round Rock Tank Scope",
    store: "5480",
    city: "Round Rock",
    state: "TX",
    phase: "Scope Clarification",
    health: "Attention",
    crew: "John Nester",
    invoice: "Not Ready",
    emails: 2,
    wo: "338091191",
    next: "Confirm DIY tank size correction and Lx scope update.",
    communications: [
      "APTIM thread matched by store, WO, city/state, subject, and ServiceChannel history.",
      "Project release email confirms Round Rock permits and inspections are not required."
    ]
  },
  {
    name: "WM 471 - Lancaster Permit Valuation",
    store: "471",
    city: "Lancaster",
    state: "TX",
    phase: "Permit Valuation",
    health: "Attention",
    crew: "Skip Zabel",
    invoice: "Not Ready",
    emails: 2,
    wo: "GMAIL-WM-471",
    next: "Keep tank/material valuation, custom drawings, and non-standard tank order together with the permit record.",
    communications: [
      "Permit valuation email matched by store, city/state, sender, and jurisdiction subject.",
      "Non-standard order thread matched by store, city/state, custom tank drawings, sender, and attachments."
    ]
  },
  {
    name: "NHM 5094 - Houston PAP Notification",
    store: "5094",
    city: "Houston",
    state: "TX",
    phase: "PAP Review",
    health: "Healthy",
    crew: "Unassigned",
    invoice: "Not Ready",
    emails: 2,
    wo: "5094.1008",
    next: "Review PAP, drawing package, DPR attachments, and project/PO status.",
    communications: [
      "PAP notification matched by store number, city/state, sender, and attachment names.",
      "Walmart thread confirms Lucernex project number 5094.1008 and pending PO follow-up."
    ]
  },
  {
    name: "WM 3296 - Houston ACC Tank Replacement",
    store: "3296",
    city: "Houston",
    state: "TX",
    phase: "Permitting Information",
    health: "Attention",
    crew: "Shay Reynalds",
    invoice: "Not Ready",
    emails: 2,
    wo: "3296.1016",
    next: "Keep DIY tank clarification with the LxRetail workflow update.",
    communications: [
      "LxRetail workflow update matched by store, WO, city/state, subject, and sender.",
      "APTIM scope clarification confirms the DIY tank is not being changed out."
    ]
  },
  {
    name: "WM 1540 - South Haven Pressure Washing",
    store: "1540",
    city: "South Haven",
    state: "MI",
    phase: "Scheduled",
    health: "Healthy",
    crew: "Shay Reynalds",
    invoice: "Not Ready",
    emails: 1,
    wo: "GMAIL-WM-1540",
    next: "Confirm ACC manager contact and lower bay access for the scheduled wash.",
    communications: ["Pressure washing thread matched by store, city/state, subject, and sender."]
  },
  {
    name: "WM 1168 - Columbia ACC UCO Completion",
    store: "1168",
    city: "Columbia",
    state: "MS",
    phase: "Completion Review",
    health: "Healthy",
    crew: "Trey Turner",
    invoice: "Review",
    emails: 1,
    wo: "GMAIL-WM-1168",
    next: "Review completion packet and level 2 triage PDF.",
    communications: ["Jotform completion packet matched by store, city/state, subject, sender, and attachments."]
  },
  {
    name: "WM 3425 - Houston Project Release",
    store: "3425",
    city: "Houston",
    state: "TX",
    phase: "Released for Production",
    health: "Healthy",
    crew: "Skip Zabel",
    invoice: "Not Ready",
    emails: 1,
    wo: "GMAIL-WM-3425",
    next: "Move to production with no Houston permit or inspection requirement.",
    communications: ["Project release email matched by store, city/state, subject, and sender."]
  },
  {
    name: "WM 458 - Aransas Pass Plans and Specs",
    store: "458",
    city: "Aransas Pass",
    state: "TX",
    phase: "Plans and Specs",
    health: "Attention",
    crew: "Skip Zabel",
    invoice: "Not Ready",
    emails: 2,
    wo: "GMAIL-WM-458",
    next: "Keep plans/spec requests and APTIM replies attached to the store card.",
    communications: [
      "Docs-needed thread matched by store, city clue, subject, and sender.",
      "Plans and specs follow-up matched by WM store subject."
    ]
  },
  {
    name: "WM 814 - Okeechobee ACC Tank Replacement",
    store: "814",
    city: "Okeechobee",
    state: "FL",
    phase: "Workflow Updated",
    health: "Attention",
    crew: "Skip Zabel",
    invoice: "Not Ready",
    emails: 2,
    wo: "814.1014",
    next: "Tie the LCR/registration thread to the LxRetail workflow documents.",
    communications: [
      "Multi-store LCR/registration thread filed to 814 by the latest visible body content.",
      "LxRetail workflow update matched by store, WO, city/state, subject, and sender."
    ]
  },
  {
    name: "WM 1621 - Laurel Pump Out Coordination",
    store: "1621",
    city: "Laurel",
    state: "MS",
    phase: "Pump Out Scheduled",
    health: "Healthy",
    crew: "Jeremiah Reynalds",
    invoice: "Not Ready",
    emails: 1,
    wo: "GMAIL-WM-1621",
    next: "Confirm Safety-Kleen service timing for the tank replacement day.",
    communications: ["Safety-Kleen pump-out reply matched by store, city/state, subject, and sender."]
  },
  {
    name: "WM 0533 - New Iberia Pump Out Coordination",
    store: "0533",
    city: "New Iberia",
    state: "LA",
    phase: "Pump Out Scheduled",
    health: "Healthy",
    crew: "Jeremiah Reynalds",
    invoice: "Not Ready",
    emails: 1,
    wo: "GMAIL-WM-0533",
    next: "Confirm final stop timing and crew coordination for 05/20 service.",
    communications: ["Safety-Kleen pump-out reply matched by store, city/state, subject, and sender."]
  },
  {
    name: "WM 4621 - Jacksonville AST Testing",
    store: "4621",
    city: "Jacksonville",
    state: "FL",
    phase: "Invoice Follow-Up",
    health: "Attention",
    crew: "Shay Reynalds",
    invoice: "Review",
    emails: 1,
    wo: "GMAIL-WM-4621",
    next: "Confirm invoice receipt and keep amended AST testing forms with the card.",
    communications: ["AST testing follow-up matched by store, city clue, subject, sender, and invoice context."]
  },
  {
    name: "WM 211 - Hillsboro Tank Observations",
    store: "211",
    city: "Hillsboro",
    state: "TX",
    phase: "Observation Resolved",
    health: "Healthy",
    crew: "Darren Fielder",
    invoice: "Not Ready",
    emails: 1,
    wo: "GMAIL-WM-211",
    next: "Retain new gauge photo confirmation with the observation thread.",
    communications: ["APTIM observation thread matched by WM Store number, city/state, subject, and sender."]
  },
  {
    name: "WM 551 - Palatka ACC UCO Completion",
    store: "551",
    city: "Palatka",
    state: "FL",
    phase: "Completion Review",
    health: "Healthy",
    crew: "Austin Wright",
    invoice: "Review",
    emails: 2,
    wo: "GMAIL-WM-551",
    next: "Review edited completion packet and original Jotform packet together.",
    communications: [
      "Edited Jotform completion packet matched by store, city/state, subject, sender, and attachments.",
      "Original Jotform completion packet retained for comparison."
    ]
  },
  {
    name: "WM 4857 - Cape Coral UCO Completion",
    store: "4857",
    city: "Cape Coral",
    state: "FL",
    phase: "Completion Review",
    health: "Healthy",
    crew: "Austin Wright",
    invoice: "Review",
    emails: 1,
    wo: "GMAIL-WM-4857",
    next: "Review UCO completion packet and Frontline tank replacement PDF.",
    communications: ["Jotform UCO completion packet matched by store, city/state, subject, sender, and attachments."]
  },
  {
    name: "WM 582 - Port Orange Tank Testing / EQ",
    store: "582",
    city: "Port Orange",
    state: "FL",
    phase: "EQ / Testing Follow-Up",
    health: "Attention",
    crew: "Skip Zabel",
    invoice: "Not Ready",
    emails: 2,
    wo: "GMAIL-WM-582",
    next: "Keep FDEP EQ number and tank testing follow-up with the store card.",
    communications: [
      "APTIM/FDEP thread matched by Wal-Mart Supercenter number, Port Orange location, subject, and sender.",
      "Earlier Port Orange EQ-number thread promoted from review after Store 582 was confirmed."
    ]
  },
  {
    name: "WM 6364 - Naples UCO Completion",
    store: "6364",
    city: "Naples",
    state: "FL",
    phase: "Completion Review",
    health: "Healthy",
    crew: "Austin Wright",
    invoice: "Review",
    emails: 1,
    wo: "GMAIL-WM-6364",
    next: "Review UCO completion packet and serial numbers before invoice readiness.",
    communications: ["Jotform UCO completion packet matched by store, city/state, subject, sender, and attachments."]
  },
  {
    name: "WM 1494 - Corpus Christi ACC Tank Replacement",
    store: "1494",
    city: "Corpus Christi",
    state: "TX",
    phase: "Workflow Updated",
    health: "Attention",
    crew: "Unassigned",
    invoice: "Not Ready",
    emails: 1,
    wo: "1494.1018",
    next: "Review LxRetail workflow update and uploaded documents.",
    communications: ["LxRetail workflow update matched by store, WO, city/state, subject, and sender."]
  },
  {
    name: "WM 7658 - Brunswick UCO Completion",
    store: "7658",
    city: "Brunswick",
    state: "GA",
    phase: "Completion Review",
    health: "Healthy",
    crew: "Austin Wright",
    invoice: "Review",
    emails: 1,
    wo: "GMAIL-WM-7658",
    next: "Review completion packet, serial numbers, and removed-tank PDF.",
    communications: ["Jotform UCO completion packet matched by store, city/state, subject, sender, and attachments."]
  },
  {
    name: "WM 3702 - Jacksonville ACC Hydraulic Lines",
    store: "3702",
    city: "Jacksonville",
    state: "FL",
    phase: "Completion Review",
    health: "Healthy",
    crew: "Austin Wright",
    invoice: "Review",
    emails: 2,
    wo: "GMAIL-WM-3702",
    next: "Review hydraulic-line completion plus earlier leak-diagnosis packet before invoice readiness.",
    communications: [
      "Jotform ACC hydraulic-line completion packet matched by store, city/state, subject, sender, and attachments.",
      "Earlier Jotform leak-diagnosis completion matched by store 3702, Jacksonville FL, technician, subject, sender, and attachments."
    ]
  },
  {
    name: "WM 1283 - Starke ACC UCO Completion",
    store: "1283",
    city: "Starke",
    state: "FL",
    phase: "Completion Review",
    health: "Healthy",
    crew: "Austin Wright",
    invoice: "Review",
    emails: 1,
    wo: "GMAIL-WM-1283",
    next: "Review completion packet covering all removed and installed ACC oil tanks.",
    communications: ["Jotform ACC/UCO completion packet matched by store, city/state, subject, sender, and attachments."]
  },
  {
    name: "SC 4702 - Friendswood Project Release",
    store: "4702",
    city: "Friendswood",
    state: "TX",
    phase: "Released for Production",
    health: "Healthy",
    crew: "Skip Zabel",
    invoice: "Not Ready",
    emails: 2,
    wo: "GMAIL-SC-4702",
    next: "Move released project into production while tracking the larger UCO tank install schedule/photos.",
    communications: [
      "Sam's Club project release matched by club number, city/state, subject, and sender.",
      "Large UCO tank install thread matched by club number, Friendswood TX subject, club contacts, and schedule/photo requests."
    ]
  },
  {
    name: "WM 5802 - Canovanas UCO Completion",
    store: "5802",
    city: "Canovanas",
    state: "PR",
    phase: "Completion Review",
    health: "Healthy",
    crew: "Jeremiah Reynalds",
    invoice: "Review",
    emails: 2,
    wo: "GMAIL-WM-5802",
    next: "Review Puerto Rico UCO completion packet against earlier tank-arrival and compliance timeline thread.",
    communications: [
      "Jotform UCO completion packet matched by store, Puerto Rico city/state, subject, sender, and attachments.",
      "Waste-oil tank timeline thread matched by store 5802, Canovanas/PR contacts, subject, sender, and compliance context."
    ]
  },
  {
    name: "WM 121 - Okmulgee UCO Tank",
    store: "121",
    city: "Okmulgee",
    state: "OK",
    phase: "Oil / Temp Tank Follow-Up",
    health: "Attention",
    crew: "Shay Reynalds",
    invoice: "Not Ready",
    emails: 1,
    wo: "GMAIL-WM-121",
    next: "Track LES pump/removal ETA and keep the temporary tank do-not-use guidance with the card.",
    communications: ["Long-running UCO tank thread matched by bare store number, city/state, subject, sender, and store-contact aliases."]
  },
  {
    name: "WM 697 - Ocala AST Inspection",
    store: "697",
    city: "Ocala",
    state: "FL",
    phase: "Inspection Coordination",
    health: "Attention",
    crew: "Skip Zabel",
    invoice: "Not Ready",
    emails: 1,
    wo: "GMAIL-WM-697",
    next: "Confirm Alachua County inspection timing for the AST change-out.",
    communications: ["AST inspection thread matched by WM store number, address, city/state, subject, and sender."]
  },
  {
    name: "WM 1907 - Hinsdale UCO / Morrison Gauge Photos",
    store: "1907",
    city: "Hinsdale",
    state: "NH",
    phase: "Completion Review",
    health: "Healthy",
    crew: "Trever",
    invoice: "Review",
    emails: 1,
    wo: "004927",
    next: "Review photo packet confirming prior UCO removal and Morrison gauge installation.",
    communications: ["Jotform UCO completion packet matched by doubled WM store subject, Store/Club field, city/state, USEV number, sender, and attachments."]
  },
  {
    name: "WM 2331 - Waterford ACC Morrison Gauge Completion",
    store: "2331",
    city: "Waterford",
    state: "CT",
    phase: "Completion Review",
    health: "Healthy",
    crew: "Trever",
    invoice: "Review",
    emails: 1,
    wo: "004918",
    next: "Review Morrison gauge replacement packet and removed wiring documentation.",
    communications: ["Jotform ACC completion packet matched by doubled WM store subject, Store/Club field, city/state, USEV number, sender, and attachments."]
  },
  {
    name: "SC 7676 - Amarillo Fee Proposal",
    store: "7676",
    city: "Amarillo",
    state: "TX",
    phase: "Proposal Approved",
    health: "Healthy",
    crew: "Darren Fielder",
    invoice: "Not Ready",
    emails: 1,
    wo: "GMAIL-SC-7676",
    next: "Track DocuSign completion and attach the stamped plans/proposal before production release.",
    communications: ["Sam's Club fee proposal thread matched by club number, city/state, subject, sender, approval reply, and proposal attachment."]
  },
  {
    name: "SC 4801 - Riverview UCO Project Release",
    store: "4801",
    city: "Riverview",
    state: "FL",
    phase: "Released for Production",
    health: "Healthy",
    crew: "John Nester",
    invoice: "Not Ready",
    emails: 2,
    wo: "4801.1015",
    next: "Proceed with production and keep uploaded LxRetail permit documents with the project card.",
    communications: ["Project release and LxRetail workflow update matched by club number, WO, city/state, subject, sender, and document names."]
  },
  {
    name: "WM 4201 - Edgewood ACC Analog Gauge",
    store: "4201",
    city: "Edgewood",
    state: "NM",
    phase: "Scheduled",
    health: "Attention",
    crew: "Darren Fielder",
    invoice: "Not Ready",
    emails: 1,
    wo: "GMAIL-WM-4201",
    next: "Track APG removal and new gauge installation by the promised end-of-week window.",
    communications: ["ACC analog-gauge thread matched by lowercase store subject, city/state, sender, and schedule response."]
  },
  {
    name: "WM 3826 - Lubbock UCO Completion",
    store: "3826",
    city: "Lubbock",
    state: "TX",
    phase: "Completion Review",
    health: "Healthy",
    crew: "Austin Wright",
    invoice: "Review",
    emails: 2,
    wo: "GMAIL-WM-3826",
    next: "Review UCO completion packet plus prior LES same-day pump-out/service coordination.",
    communications: [
      "Jotform UCO completion packet matched by doubled WM store subject, Store/Club field, city/state, sender, serial numbers, and attachments.",
      "Earlier LES service coordination matched by WM Supercenter number, Lubbock TX subject, sender, and same UCO replacement thread."
    ]
  },
  {
    name: "WM 4843 - Pearland Fire Final Inspection",
    store: "4843",
    city: "Pearland",
    state: "TX",
    phase: "Inspection Approved",
    health: "Healthy",
    crew: "Skip Zabel",
    invoice: "Not Ready",
    emails: 1,
    wo: "COM2025-10030",
    next: "Attach approved Pearland fire final inspection to close permit evidence.",
    communications: ["Inspection-complete thread matched by parenthesized store/city/state, permit number, sender, and approved inspection result."]
  },
  {
    name: "WM 175 - Collierville UCO Workflow",
    store: "175",
    city: "Collierville",
    state: "TN",
    phase: "Workflow Updated",
    health: "Attention",
    crew: "Unassigned",
    invoice: "Not Ready",
    emails: 1,
    wo: "175.1016",
    next: "Review uploaded DPR, drawing package, PAP, and permit application documents.",
    communications: ["LxRetail workflow update matched by store, WO, city/state, subject, sender, and document names."]
  },
  {
    name: "WM 2928 - Goose Creek Project Release",
    store: "2928",
    city: "Goose Creek",
    state: "SC",
    phase: "Released for Production",
    health: "Healthy",
    crew: "John Nester",
    invoice: "Not Ready",
    emails: 1,
    wo: "GMAIL-WM-2928",
    next: "Move to production with no permit or inspection requirement.",
    communications: ["Project release matched by WM store number, city/state, subject, sender, and no-permit/no-inspection note."]
  },
  {
    name: "SC 4794 - Lakeland Grease Tank",
    store: "4794",
    city: "Lakeland",
    state: "FL",
    phase: "Tank Removal Follow-Up",
    health: "Attention",
    crew: "James Sbanotto",
    invoice: "Not Ready",
    emails: 1,
    wo: "344185400",
    next: "Track extra grease tank pickup/removal after install and keep service photos with the card.",
    communications: ["Sam's Club grease-tank thread matched by club number, city/state, WO, subject, sender, and removal request."]
  },
  {
    name: "SC 8156 - Laredo UCO Tank Replacement",
    store: "8156",
    city: "Laredo",
    state: "TX",
    phase: "Scheduled",
    health: "Attention",
    crew: "Ryan Sherman",
    invoice: "Not Ready",
    emails: 1,
    wo: "GMAIL-SC-8156",
    next: "Track Reynalds scheduled replacement after the 03/24 tank pump-out window.",
    communications: ["Sam's Club UCO replacement thread matched by club number, city/state, subject, sender, and pump-out/schedule details."]
  },
  {
    name: "SC 8224 - Wichita Falls UCO Tank Replacement",
    store: "8224",
    city: "Wichita Falls",
    state: "TX",
    phase: "Scheduled",
    health: "Attention",
    crew: "Shay Reynalds",
    invoice: "Not Ready",
    emails: 1,
    wo: "GMAIL-SC-8224",
    next: "Confirm replacement schedule and keep vendor coordination with the job card.",
    communications: ["Sam's Club UCO replacement thread matched by club number, Wichita Falls TX subject, sender, and replacement coordination."]
  },
  {
    name: "WM 970 - Picayune UCO Tank Replacement",
    store: "970",
    city: "Picayune",
    state: "MS",
    phase: "Replacement Requested",
    health: "Attention",
    crew: "Kleenco / install team",
    invoice: "Not Ready",
    emails: 1,
    wo: "GMAIL-WM-970",
    next: "Track damaged UCO tank replacement, temporary smell mitigation, and May install timing.",
    communications: ["UCO replacement thread matched by Walmart store number, Picayune MS subject, sender, store contact signature, and damaged/leaking tank details."]
  },
  {
    name: "SC 6521 - Houma UCO Tank Replacement",
    store: "6521",
    city: "Houma",
    state: "LA",
    phase: "Scheduled",
    health: "Attention",
    crew: "Shay Reynalds",
    invoice: "Not Ready",
    emails: 1,
    wo: "GMAIL-SC-6521",
    next: "Track 03/19 install, pump-out, and temporary bin replacement details.",
    communications: ["Sam's Club UCO replacement thread matched by club number, Houma LA subject, sender, pump-out update, and scheduled install date."]
  },
  {
    name: "SC 8263 - Tulsa UCO Tank Replacement",
    store: "8263",
    city: "Tulsa",
    state: "OK",
    phase: "Tank Ordered",
    health: "Attention",
    crew: "Shay Reynalds",
    invoice: "Not Ready",
    emails: 1,
    wo: "GMAIL-SC-8263",
    next: "Track tank order, temporary FOG bin, pump-out, and late-April install window.",
    communications: ["Sam's Club UCO replacement thread matched by club number, Tulsa OK subject, sender, tank-order email, and damaged/undersized tank details."]
  },
  {
    name: "WM 5172 - Perry Lucernex Workflow",
    store: "5172",
    city: "Perry",
    state: "FL",
    phase: "Lucernex Created",
    health: "Healthy",
    crew: "Shay Reynalds",
    invoice: "Not Ready",
    emails: 2,
    wo: "GMAIL-WM-5172",
    next: "Keep Lucernex workflow confirmation, APTIM upload note, and ACC completion packet with the project card.",
    communications: [
      "Workflow thread matched by store number, Perry FL subject, sender, Lucernex confirmation, and APTIM upload response.",
      "Jotform ACC completion packet matched by store, Perry FL city/state, sender, completion date, serial numbers, and attachments."
    ]
  },
  {
    name: "WM 690 - Elizabethton UCO Tank Replacement",
    store: "690",
    city: "Elizabethton",
    state: "TN",
    phase: "Install Scheduled",
    health: "Attention",
    crew: "Jeremiah Reynalds",
    invoice: "Not Ready",
    emails: 1,
    wo: "GMAIL-WM-690",
    next: "Track 03/08 install, final pump-out, and Lucernex/PO upload follow-up.",
    communications: ["UCO replacement thread matched by Walmart store number, Elizabethton TN subject, sender, pump-out update, and scheduled install date."]
  },
  {
    name: "WM 5780 - Paragould UCO Completion",
    store: "5780",
    city: "Paragould",
    state: "AR",
    phase: "Completion Review",
    health: "Healthy",
    crew: "Jeremiah Reynalds",
    invoice: "Review",
    emails: 1,
    wo: "GMAIL-WM-5780",
    next: "Review UCO completion packet and removed-tank documentation.",
    communications: ["Jotform UCO completion packet matched by store, Paragould AR city/state, sender, completion date, and attachments."]
  },
  {
    name: "WM 1185 - Austin ACC Tank Workflow",
    store: "1185",
    city: "Austin",
    state: "TX",
    phase: "Workflow Updated",
    health: "Healthy",
    crew: "Krista Krenz",
    invoice: "Not Ready",
    emails: 1,
    wo: "1185.1013",
    next: "Keep uploaded SPCC document with the ACC tank replacement project.",
    communications: ["LxRetail workflow update matched by store, WO, Austin TX subject, sender, and uploaded SPCC document name."]
  },
  {
    name: "WM 5960 - Socorro Caddy Motor Warranty",
    store: "5960",
    city: "Socorro",
    state: "TX",
    phase: "Parts Tracking",
    health: "Attention",
    crew: "Darren Fielder",
    invoice: "Not Ready",
    emails: 1,
    wo: "GMAIL-WM-5960",
    next: "Confirm UPS movement and replacement motor delivery for the caddy repair.",
    communications: ["Caddy warranty thread matched by store, Socorro TX subject, sender, replacement motor tracking, and UPS screenshot."]
  },
  {
    name: "WM 3535 - Epping ACC Gauge",
    store: "3535",
    city: "Epping",
    state: "NH",
    phase: "Awarded",
    health: "Attention",
    crew: "Rachel Barton",
    invoice: "Not Ready",
    emails: 1,
    wo: "USEV-004928",
    next: "Expedite APG removal and physical gauge placement for ACC wastewater tank.",
    communications: ["ACC gauge thread matched by store, Epping NH subject/body, USEV number, sender, and award note."]
  },
  {
    name: "WM 4445 - Clemson UCO Completion",
    store: "4445",
    city: "Clemson",
    state: "SC",
    phase: "Completion Review",
    health: "Healthy",
    crew: "Jeremiah Reynalds",
    invoice: "Review",
    emails: 1,
    wo: "GMAIL-WM-4445",
    next: "Review UCO completion packet and removed-tank documentation.",
    communications: ["Jotform UCO completion packet matched by store, Clemson SC city/state, sender, completion date, serial number, and attachments."]
  },
  {
    name: "WM 1090 - Jacksonville ACC Completion",
    store: "1090",
    city: "Jacksonville",
    state: "FL",
    phase: "Completion Review",
    health: "Healthy",
    crew: "Joseph Gossage",
    invoice: "Review",
    emails: 1,
    wo: "GMAIL-WM-1090",
    next: "Review ACC completion packet and tank serial numbers.",
    communications: ["Jotform ACC completion packet matched by doubled WM store subject, Jacksonville FL city/state, sender, serial numbers, and attachments."]
  },
  {
    name: "WM 501 - Laurel ACC Tank Workflow",
    store: "501",
    city: "Laurel",
    state: "MS",
    phase: "Workflow Updated",
    health: "Healthy",
    crew: "Krista Krenz",
    invoice: "Not Ready",
    emails: 1,
    wo: "501.1011",
    next: "Keep uploaded DPR, drawing package, and PAP documents with the ACC tank replacement card.",
    communications: ["LxRetail workflow update matched by store, WO, Laurel MS subject, sender, and uploaded permit document names."]
  },
  {
    name: "WM 4421 - Columbus UCO Workflow",
    store: "4421",
    city: "Columbus",
    state: "GA",
    phase: "Workflow Updated",
    health: "Healthy",
    crew: "Krista Krenz",
    invoice: "Not Ready",
    emails: 1,
    wo: "4421.1010",
    next: "Keep uploaded DPR, drawing package, fire safety worksheet, and PAP documents with the UCO card.",
    communications: ["LxRetail workflow update matched by store, WO, Columbus GA subject, sender, and uploaded permit document names."]
  },
  {
    name: "NHM 7251 - Fort Worth UCO Tank Replacement",
    store: "7251",
    city: "Fort Worth",
    state: "TX",
    phase: "Service Dispatched",
    health: "Attention",
    crew: "Shay Reynalds",
    invoice: "Not Ready",
    emails: 1,
    wo: "GMAIL-NHM-7251",
    next: "Track oil pickup ETA, temporary bin dispatch, and replacement tank ship date.",
    communications: ["NHM UCO replacement thread matched by store number, Fort Worth TX subject/body, sender, oil pickup request, and temp-bin dispatch."]
  }
];

const reviewItems = [
  {
    subject: "Frontline International Invoice(s) - 71768",
    reason: "Invoice email did not expose a store number, WO, or PO in the Gmail search result."
  },
  {
    subject: "Tracking Information For PO# WM-0157",
    reason: "PO was detected but no existing store/job card was identified from the Gmail search result."
  },
  {
    subject: "Re: Walmart - Request for Anti-Siphon Exemption",
    reason: "Program request did not expose a store number, WO, or PO."
  },
  {
    subject: "RE: Next set of 6 stores (Sales Orders #7296 - #7301), adding Sales Order #7348",
    reason: "Supplier sales-order thread references multiple stores and sales orders; attachment review is required before filing."
  },
  {
    subject: "Re: Newberry Tank Billing",
    reason: "Billing thread maps multiple invoices to stores 814, 551, 563, 942, and 943; split by invoice before filing."
  },
  {
    subject: "Re: Pump out Request",
    reason: "Coordination thread references multiple Sam's Club locations and service windows; split by store before filing."
  },
  {
    subject: "Re: Home Office and Transportation Grease Tank Removal",
    reason: "Non-store Home Office and Transportation removal billing needs a separate project or expense card before filing."
  },
  {
    subject: "Apr 2026 Frontline Monthly Statement",
    reason: "Monthly supplier statement spans multiple invoices and does not expose a single store, WO, or PO for filing."
  },
  {
    subject: "Re: store: WM 1118 03-31-2026 skip@reynaldsbrothers.com ACC Walmart ACC UCO Work Completion [^]",
    reason: "Jotform has store 1118 but the City/State field is incomplete or misspelled as Batch Springs with no state; confirm location before filing."
  },
  {
    subject: "Contracts for permitting",
    reason: "Email contains four separate permit-contract attachments for stores 942, 943, 2690, and 563; split by attachment/store before filing."
  },
  {
    subject: "Re: Store and LES notifications",
    reason: "Route notification lists multiple upcoming store deliveries and service windows; split by store before filing."
  },
  {
    subject: "Walmart 1590 Hialeah FL, Sam's Club 6217 (Miami Dade) Doral, FL invoices",
    reason: "Invoice email spans two store projects and two PDF invoices; split by attachment/store before filing."
  },
  {
    subject: "Mar 2026 Frontline Monthly Statement",
    reason: "Monthly supplier statement spans multiple invoices and does not expose a single store, WO, or PO for filing."
  },
  {
    subject: "Re: store: WM 5182 02-23-2026 jeremiah@reynaldsbrothers.com UCO Walmart ACC UCO Work Completion [^]",
    reason: "Jotform has store 5182 and Murfreesboro but no state in the sampled city/state field; confirm state before filing."
  },
  {
    subject: "Re: Exciting Addition to the AST-SPCC Program",
    reason: "Program staffing announcement has no store, WO, PO, or job card target."
  },
  {
    subject: "Friday the 13th? Don't be unlucky when it comes to safety",
    reason: "Vendor marketing email has no store, WO, PO, or active job card target."
  }
];

const status = {
  source: "Gmail",
  label: "WalMart Tanks",
  alternateLabel: "wmtanks",
  mailboxPath: "wmtanks@reynaldsbrothers.com",
  indexedMessageCount: 1600,
  hasMoreIndexedMessages: true,
  filedCommunications: jobs.reduce((total, job) => total + job.emails, 0),
  reviewQueueItems: reviewItems.length,
  storeCount: jobs.length,
  liveStatus: "partial-live-snapshot",
  updatedAt: "2026-07-30T01:00:00-06:00"
};

function esc(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

function page() {
  const attention = jobs.filter((job) => job.health !== "Healthy").length;
  const ready = jobs.filter((job) => job.invoice === "Review").length;
  const cards = jobs
    .map(
      (job) => `
        <button class="row" data-status="${esc(job.health)}" data-search="${esc(`${job.name} ${job.store} ${job.city} ${job.state} ${job.wo} ${job.crew}`.toLowerCase())}">
          <span><b>${esc(job.name)}</b><small>Store ${esc(job.store)} · ${esc(job.city)}, ${esc(job.state)}</small></span>
          <span><b>${esc(job.phase)}</b><small>WO ${esc(job.wo)}</small></span>
          <span><b>${esc(job.crew)}</b><small>${esc(job.invoice)}</small></span>
          <span><b>${job.emails} emails</b><small>${esc(job.health)}</small></span>
          <span>${esc(job.next)}</span>
        </button>`
    )
    .join("");

  const review = reviewItems
    .map((item) => `<li><b>${esc(item.subject)}</b><span>${esc(item.reason)}</span></li>`)
    .join("");

  const communicationRows = jobs
    .map((job) => {
      const notes = job.communications.map((note) => `<li>${esc(note)}</li>`).join("");
      return `<details><summary>${esc(job.store)} · ${esc(job.city)}, ${esc(job.state)} · ${job.emails} email${job.emails === 1 ? "" : "s"}</summary><ul>${notes}</ul></details>`;
    })
    .join("");

  return `<!doctype html>
  <html lang="en">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>Reynalds Brothers OS Trial</title>
      <style>
        :root { --bg:#f7f1e8; --ink:#161616; --muted:#5f5f5f; --gold:#b88a44; --card:#fff; --line:rgba(184,138,68,.28); --warn:#8f3f18; --ok:#28694b; }
        * { box-sizing:border-box; }
        body { margin:0; background:var(--bg); color:var(--ink); font-family:Arial, Helvetica, sans-serif; }
        .app { min-height:100vh; display:grid; grid-template-columns:260px 1fr; }
        aside.shell { background:#161616; color:white; padding:24px 18px; }
        .brand { display:flex; gap:12px; align-items:center; margin-bottom:28px; }
        .mark { width:42px; height:42px; border-radius:50%; background:var(--gold); display:grid; place-items:center; font:700 22px Georgia, serif; }
        .brand b { display:block; font:700 21px Georgia, serif; }
        .brand span, nav a { color:#d5d5d5; font-size:13px; }
        nav a { display:block; text-decoration:none; padding:12px 14px; border-radius:8px; margin-bottom:6px; }
        nav a.active { background:rgba(184,138,68,.24); color:white; }
        main { padding:24px; }
        header { display:flex; gap:12px; justify-content:space-between; align-items:center; margin-bottom:24px; }
        input { border:1px solid var(--line); border-radius:999px; padding:13px 16px; min-width:320px; font:inherit; }
        .eyebrow { color:var(--gold); text-transform:uppercase; font-size:12px; font-weight:700; letter-spacing:1.8px; margin-bottom:8px; }
        h1 { font:700 clamp(34px,5vw,54px)/1 Georgia, serif; margin:0; }
        h2 { font:700 24px/1.1 Georgia, serif; margin:0 0 14px; }
        p { color:var(--muted); line-height:1.5; }
        .grid { display:grid; grid-template-columns:repeat(5,minmax(0,1fr)); gap:14px; margin:24px 0; }
        .card { background:var(--card); border:1px solid var(--line); border-radius:8px; padding:18px; box-shadow:0 14px 35px rgba(0,0,0,.06); }
        .metric span { color:var(--muted); font-size:12px; }
        .metric strong { display:block; font:700 32px Georgia, serif; margin-top:7px; }
        .layout { display:grid; grid-template-columns:1fr 360px; gap:18px; align-items:start; }
        .rows { display:grid; gap:10px; }
        .row { width:100%; display:grid; grid-template-columns:1.45fr .95fr .7fr .62fr 1.28fr; gap:12px; border:1px solid var(--line); border-radius:8px; background:white; padding:13px; text-align:left; color:var(--ink); cursor:pointer; }
        .row:hover { border-color:rgba(184,138,68,.7); background:#fbf7f0; }
        .row b, .row small, li b, li span { display:block; }
        .row b { font:700 16px Georgia, serif; }
        .row small, .row span, li span, details li { color:var(--muted); font-size:12px; line-height:1.4; }
        ul { list-style:none; padding:0; margin:0; display:grid; gap:12px; }
        li { border-top:1px solid var(--line); padding-top:12px; }
        .pill { display:inline-block; border:1px solid var(--line); border-radius:999px; padding:8px 12px; font-size:12px; font-weight:700; }
        .tools { display:flex; gap:8px; flex-wrap:wrap; margin:18px 0; }
        .tools button { border:1px solid var(--line); background:white; border-radius:999px; padding:9px 12px; font-weight:700; cursor:pointer; }
        .tools button.active { background:#161616; color:white; border-color:#161616; }
        details { border-top:1px solid var(--line); padding:12px 0; }
        summary { cursor:pointer; font-weight:700; }
        details ul { list-style:disc; padding-left:18px; margin-top:10px; }
        details li { border:0; padding:0; }
        @media (max-width:1100px) { .app,.grid,.layout,.row { grid-template-columns:1fr; } input { min-width:0; width:100%; } header { align-items:stretch; flex-direction:column; } }
      </style>
    </head>
    <body>
      <div class="app">
        <aside class="shell">
          <div class="brand"><div class="mark">RB</div><div><b>Reynalds Brothers</b><span>OS Trial</span></div></div>
          <nav><a class="active" href="/">Operations</a><a href="/api/reynalds-brothers/live-data">Live Data API</a><a href="/api/reynalds-brothers/jobs">Jobs API</a></nav>
        </aside>
        <main>
          <header>
            <div><div class="eyebrow">RB-001 · Hosted Trial</div><h1>Operations Center</h1></div>
            <input id="search" placeholder="Search jobs, stores, cities, WO..." />
          </header>
          <p>Private hosted trial surface for WalMart Tanks communications, store/job cards, and the review workflow.</p>
          <section class="grid">
            <article class="card metric"><span>Store Cards</span><strong>${status.storeCount}</strong></article>
            <article class="card metric"><span>Needs Attention</span><strong>${attention}</strong></article>
            <article class="card metric"><span>Indexed Gmail</span><strong>${status.indexedMessageCount}+</strong></article>
            <article class="card metric"><span>Filed Emails</span><strong>${status.filedCommunications}</strong></article>
            <article class="card metric"><span>Email Review</span><strong>${status.reviewQueueItems}</strong></article>
          </section>
          <section class="card" style="margin-bottom:18px">
            <div class="eyebrow">Live Data</div>
            <h2>${status.label} Gmail Feed <span class="pill">${status.liveStatus}</span></h2>
            <p>${status.indexedMessageCount} Gmail IDs indexed from ${status.mailboxPath}; more pages remain. Filed communications are grouped by store number, WO, PO, city/state, subject, and sender, with unmatched emails held in review.</p>
          </section>
          <div class="tools">
            <button class="active" data-filter="all">All</button>
            <button data-filter="Attention">Attention</button>
            <button data-filter="Healthy">Healthy</button>
            <button data-filter="ready">Invoice Review (${ready})</button>
          </div>
          <section class="layout">
            <article class="card"><h2>Work Command Queue</h2><div class="rows" id="rows">${cards}</div></article>
            <aside class="card"><h2>Review Inbox</h2><ul>${review}</ul></aside>
          </section>
          <section class="card" style="margin-top:18px"><h2>Filed Communications</h2>${communicationRows}</section>
        </main>
      </div>
      <script>
        const search = document.getElementById("search");
        const rows = Array.from(document.querySelectorAll(".row"));
        const filters = Array.from(document.querySelectorAll(".tools button"));
        let activeFilter = "all";
        function applyFilters() {
          const q = search.value.trim().toLowerCase();
          rows.forEach((row) => {
            const matchesText = row.dataset.search.includes(q);
            const matchesFilter = activeFilter === "all" || row.dataset.status === activeFilter || (activeFilter === "ready" && row.textContent.includes("Review"));
            row.style.display = matchesText && matchesFilter ? "grid" : "none";
          });
        }
        search.addEventListener("input", applyFilters);
        filters.forEach((button) => button.addEventListener("click", () => {
          filters.forEach((item) => item.classList.remove("active"));
          button.classList.add("active");
          activeFilter = button.dataset.filter;
          applyFilters();
        }));
      </script>
    </body>
  </html>`;
}

export default {
  async fetch(request) {
    const url = new URL(request.url);
    if (url.pathname === "/api/reynalds-brothers/live-data") {
      return Response.json(status);
    }
    if (url.pathname === "/api/reynalds-brothers/jobs") {
      return Response.json({ status, jobs, reviewItems });
    }
    return new Response(page(), {
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "no-store"
      }
    });
  }
};
