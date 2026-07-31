import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const workspace = await prisma.workspace.upsert({
    where: { id: "wks_koinonia" },
    update: {},
    create: {
      id: "wks_koinonia",
      name: "Koinonia",
      type: "real_estate_operations",
      status: "active",
      settings: {
        brand: {
          colors: ["#f7f1e8", "#161616", "#b88a44"]
        }
      }
    }
  });

  const ownerRole = await prisma.role.upsert({
    where: { id: "role_owner" },
    update: {},
    create: {
      id: "role_owner",
      workspaceId: workspace.id,
      name: "Owner",
      permissions: {
        all: true
      }
    }
  });

  await prisma.user.upsert({
    where: { email: "owner@example.com" },
    update: {},
    create: {
      id: "usr_owner",
      workspaceId: workspace.id,
      name: "Jeremiah Reynalds",
      email: "owner@example.com",
      roleId: ownerRole.id,
      status: "active"
    }
  });

  const objects = [
    {
      id: "obj_txn_smith",
      objectType: "Transaction",
      name: "Smith Transaction",
      status: "Closing Prep",
      health: "Critical",
      nextAction: "Complete final QA review"
    },
    {
      id: "obj_rel_sarah",
      objectType: "Relationship",
      name: "Sarah Johnson",
      status: "Active Client",
      health: "Healthy",
      nextAction: "Prepare review request after closing"
    },
    {
      id: "obj_task_qa",
      objectType: "Task",
      name: "Complete final QA review",
      status: "Due Now",
      health: "Critical",
      nextAction: "Verify closing figures and commission paperwork"
    },
    {
      id: "obj_invoice_1007",
      objectType: "Invoice",
      name: "INV-1007 Smith Transaction Invoice",
      status: "Paid",
      health: "Healthy",
      nextAction: "Archive financial record"
    }
  ];

  for (const object of objects) {
    await prisma.rosObject.upsert({
      where: { id: object.id },
      update: object,
      create: {
        ...object,
        workspaceId: workspace.id
      }
    });
  }


  const rbWorkspace = await prisma.workspace.upsert({
    where: { id: "wks_reynalds_brothers" },
    update: {},
    create: {
      id: "wks_reynalds_brothers",
      name: "Reynalds Brothers",
      type: "field_operations",
      status: "active",
      settings: {
        domain: "managed_company",
        primaryObject: "rb.work_item"
      }
    }
  });

  const rbObjects = [
    {
      id: "rb_wi_acc_1540",
      objectType: "rb.work_item",
      name: "WM 1540 — ACC Lower Bay Pressure Washing",
      status: "Planning",
      health: "Watch",
      nextAction: "Confirm crew, equipment, disposal, and completion documentation.",
      data: {
        serviceLine: "Pressure Washing",
        customer: "Walmart",
        storeNumber: "1540",
        city: "South Haven",
        state: "MI",
        sourceSystem: "manual_seed",
        workType: "Lower Bay Pressure Washing",
        workOrderNumber: "RB-WO-1540-001",
        siteName: "Walmart 1540",
        phase: "Pre-Job Planning",
        crewLead: "Jeremiah Reynalds",
        crewMembers: ["Gavyn"],
        equipmentRequired: ["Hot water pressure washer", "Vacuum truck", "Surface cleaner", "PPE"],
        documentationRequired: ["Before photos", "After photos", "Disposal manifest", "Completion notes"],
        operationalRisks: ["Disposal coordination", "Water volume control", "Overnight access window"],
        scheduledStart: null,
        scheduledEnd: null,
        invoiceStatus: "Not Ready"
      }
    },
    {
      id: "rb_wi_uco_4672",
      objectType: "rb.work_item",
      name: "WM 4672 — UCO Tank Replacement",
      status: "Intake",
      health: "Healthy",
      nextAction: "Review Walmart project details and confirm scope.",
      data: {
        serviceLine: "UCO",
        customer: "Walmart",
        storeNumber: "4672",
        city: "Montgomery",
        state: "AL",
        sourceSystem: "manual_seed",
        workType: "Used Cooking Oil Tank Replacement",
        workOrderNumber: "RB-WO-4672-001",
        siteName: "Walmart 4672",
        phase: "Intake",
        crewLead: null,
        crewMembers: [],
        equipmentRequired: ["UCO tank", "Install tools", "PPE"],
        documentationRequired: ["Scope confirmation", "Before photos", "Install photos", "Completion notes"],
        operationalRisks: ["Scope confirmation pending", "Material availability"],
        scheduledStart: null,
        scheduledEnd: null,
        invoiceStatus: "Not Ready"
      }
    },
    {
      id: "rb_wi_zurn_alarm_001",
      objectType: "rb.work_item",
      name: "Zurn Alarm Installation — Sample Project",
      status: "Open",
      health: "Healthy",
      nextAction: "Confirm site contact and required alarm materials.",
      data: {
        serviceLine: "Zurn",
        customer: "Zurn",
        sourceSystem: "manual_seed",
        workType: "Grease Interceptor Alarm Installation",
        workOrderNumber: "RB-WO-ZURN-001",
        siteName: "Zurn Sample Site",
        phase: "Open",
        crewLead: null,
        crewMembers: [],
        equipmentRequired: ["Alarm materials", "Install tools", "PPE"],
        documentationRequired: ["Site contact confirmation", "Material list", "Completion photos"],
        operationalRisks: ["Site contact not confirmed", "Material requirements pending"],
        scheduledStart: null,
        scheduledEnd: null,
        invoiceStatus: "Not Ready"
      }
    },
    {
      id: "rb_wi_wmtanks_6958",
      objectType: "rb.work_item",
      name: "WM 6958 — ACC UCO Tank Completion",
      status: "Completed Documentation",
      health: "Healthy",
      nextAction: "Review completion PDF and confirm invoice readiness.",
      data: {
        serviceLine: "WalMart Tanks",
        customer: "Walmart",
        storeNumber: "6958",
        city: "Cameron",
        state: "NC",
        sourceSystem: "gmail:wmtanks",
        workType: "ACC UCO Work Completion",
        workOrderNumber: "GMAIL-19faf007bfe01e01",
        siteName: "Walmart 6958",
        phase: "Completion Review",
        crewLead: "Trey Turner",
        invoiceStatus: "Review",
        communications: [
          {
            gmailId: "19faf007bfe01e01",
            threadId: "19faf007bfe01e01",
            subject: "Re: store: WM 6958 07-29-2026 trey.turner@reynaldsbrothers.com Walmart ACC UCO Work Completion [^]",
            sender: "\"'Jotform' via Walmart Paperwork\" wmpw@reynaldsbrothers.com",
            sentAt: "2026-07-29T13:51:08-04:00",
            storeNumber: "6958",
            city: "Cameron",
            state: "NC",
            matchConfidence: "high",
            displayUrl: "https://mail.google.com/mail/#all/19faf007bfe01e01",
            attachmentNames: ["6611566090354484579_signature_12.png", "6958-Completed-level-2-triage-on-all-tanks.pdf"]
          }
        ]
      }
    },
    {
      id: "rb_wi_wmtanks_3347",
      objectType: "rb.work_item",
      name: "WM 3347 — ServiceChannel Note",
      status: "Needs Review",
      health: "Attention",
      nextAction: "Read latest ServiceChannel note for WO 349228841.",
      data: {
        serviceLine: "WalMart Tanks",
        customer: "Walmart",
        storeNumber: "3347",
        city: "WINTER HAVEN",
        state: "FL",
        sourceSystem: "gmail:wmtanks",
        workType: "ServiceChannel Work Order Note",
        workOrderNumber: "349228841",
        siteName: "Supercenter FS Market 116-B",
        phase: "Note Review",
        crewLead: null,
        invoiceStatus: "Not Ready",
        communications: [
          {
            gmailId: "19fae84c1e1dd290",
            threadId: "19fae22e0f8136ea",
            subject: "New Note | Location ID: 3347 | WINTER HAVEN | FL | P3-ONSITE W/I 3 DAYS | 349228841 | WALMART STORES, INC | Reynalds Brothers, LLC",
            sender: "ServiceChannel 349228841@wonote.servicechannel.net",
            sentAt: "2026-07-29T15:36:01+00:00",
            storeNumber: "3347",
            workOrderNumber: "349228841",
            city: "WINTER HAVEN",
            state: "FL",
            matchConfidence: "high",
            displayUrl: "https://mail.google.com/mail/#all/19fae84c1e1dd290",
            attachmentNames: []
          }
        ]
      }
    },
    {
      id: "rb_wi_wmtanks_1087",
      objectType: "rb.work_item",
      name: "WM 1087 — Stuart ACC UCO Tank Work",
      status: "Active Documentation",
      health: "Attention",
      nextAction: "Reconcile ServiceChannel note, triage lock, and completion paperwork.",
      data: {
        serviceLine: "WalMart Tanks",
        customer: "Walmart",
        storeNumber: "1087",
        city: "Stuart",
        state: "FL",
        sourceSystem: "gmail:wmtanks",
        workType: "ACC UCO Tank Work",
        workOrderNumber: "357811854",
        siteName: "Walmart 1087",
        phase: "Documentation Reconciliation",
        crewLead: "Trey Turner",
        invoiceStatus: "Review",
        communications: [
          {
            gmailId: "19fae7824e0eb421",
            subject: "New Note | Location ID: 1087 | STUART | FL | P3-Onsite w/i 3 days | 357811854 | WALMART STORES, INC | Reynalds Brothers, LLC",
            sender: "ServiceChannel 357811854@wonote.servicechannel.net",
            sentAt: "2026-07-29T15:22:14+00:00",
            storeNumber: "1087",
            workOrderNumber: "357811854",
            city: "STUART",
            state: "FL",
            matchConfidence: "high",
            displayUrl: "https://mail.google.com/mail/#all/19fae7824e0eb421",
            attachmentNames: []
          },
          {
            gmailId: "19fa523a647e2068",
            subject: "Re: store: WM 1087 07-27-2026 trey.turner@reynaldsbrothers.com ACC Walmart ACC UCO Work Completion [^]",
            sender: "\"'Jotform' via Walmart Paperwork\" wmpw@reynaldsbrothers.com",
            sentAt: "2026-07-27T15:53:21-04:00",
            storeNumber: "1087",
            city: "Stuart",
            state: "FL",
            matchConfidence: "high",
            displayUrl: "https://mail.google.com/mail/#all/19fa523a647e2068",
            attachmentNames: ["6609911650831452753_signature_12.png", "1087-Completed-level-2-triage-on-all-tanks.pdf"]
          },
          {
            gmailId: "19fa51c739beb801",
            subject: "Re: WM 1087 Stuart State: Florida, AUTO CENTER Tank Triage - Locked 07/27/2026 ACCUCO1",
            sender: "\"'Jotform' via WalMart Tanks Program\" wmtanks@reynaldsbrothers.com",
            sentAt: "2026-07-27T15:45:28-04:00",
            storeNumber: "1087",
            city: "Stuart",
            state: "FL",
            matchConfidence: "high",
            displayUrl: "https://mail.google.com/mail/#all/19fa51c739beb801",
            attachmentNames: ["6609906990832926175-AUTO-CENTER-Tank-Triage-Locked.pdf"]
          }
        ]
      }
    },
    {
      id: "rb_wi_wmtanks_773",
      objectType: "rb.work_item",
      name: "WM 773 — ServiceChannel Note",
      status: "Needs Review",
      health: "Attention",
      nextAction: "Read latest ServiceChannel note for WO 354598199.",
      data: {
        serviceLine: "WalMart Tanks",
        customer: "Walmart",
        storeNumber: "773",
        city: "EUNICE",
        state: "LA",
        sourceSystem: "gmail:wmtanks",
        workType: "ServiceChannel Work Order Note",
        workOrderNumber: "354598199",
        siteName: "Walmart 773",
        phase: "Note Review",
        invoiceStatus: "Not Ready",
        communications: [
          {
            gmailId: "19fae829112233b6",
            subject: "New Note | Location ID: 773 | EUNICE | LA | P3-Onsite w/i 3 days | 354598199 | WALMART STORES, INC | Reynalds Brothers, LLC",
            sender: "ServiceChannel 354598199@wonote.servicechannel.net",
            sentAt: "2026-07-29T15:33:37+00:00",
            storeNumber: "773",
            workOrderNumber: "354598199",
            city: "EUNICE",
            state: "LA",
            matchConfidence: "high",
            displayUrl: "https://mail.google.com/mail/#all/19fae829112233b6",
            attachmentNames: []
          }
        ]
      }
    },
    {
      id: "rb_wi_wmtanks_3595",
      objectType: "rb.work_item",
      name: "WM 3595 — Fayetteville ACC UCO Tank Work",
      status: "Completed Documentation",
      health: "Healthy",
      nextAction: "Review triage lock and completion paperwork together.",
      data: {
        serviceLine: "WalMart Tanks",
        customer: "Walmart",
        storeNumber: "3595",
        city: "Fayetteville",
        state: "NC",
        sourceSystem: "gmail:wmtanks",
        workType: "ACC UCO Tank Work",
        workOrderNumber: "GMAIL-WM-3595",
        siteName: "Walmart 3595",
        phase: "Completion Review",
        crewLead: "Trey Turner",
        invoiceStatus: "Review",
        communications: [
          {
            gmailId: "19facc52a9b5c936",
            subject: "Re: WM 3595 Fayetteville State: North Carolina, AUTO CENTER Tank Triage - Locked 07/28/2026 ACCUCO1",
            sender: "\"'Jotform' via expense\" expense@reynaldsbrothers.com",
            sentAt: "2026-07-29T03:27:06-04:00",
            storeNumber: "3595",
            city: "Fayetteville",
            state: "NC",
            matchConfidence: "high",
            displayUrl: "https://mail.google.com/mail/#all/19facc52a9b5c936",
            attachmentNames: ["6611191700356771888-AUTO-CENTER-Tank-Triage-Locked.pdf"]
          },
          {
            gmailId: "19faba0639f9fab1",
            subject: "Re: store: WM 3595 07-28-2026 trey.turner@reynaldsbrothers.com Walmart ACC UCO Work Completion [^]",
            sender: "\"'Jotform' via Walmart Paperwork\" wmpw@reynaldsbrothers.com",
            sentAt: "2026-07-28T22:07:19-04:00",
            storeNumber: "3595",
            city: "Fayetteville",
            state: "NC",
            matchConfidence: "high",
            displayUrl: "https://mail.google.com/mail/#all/19faba0639f9fab1",
            attachmentNames: ["6610999975783822318_signature_12.png", "3595-Competed-level-2-triage-on-all-tanks.pdf"]
          }
        ]
      }
    },
    {
      id: "rb_wi_wmtanks_2929",
      objectType: "rb.work_item",
      name: "WM 2929 — Hope Mills ACC UCO Tank Work",
      status: "Completed Documentation",
      health: "Healthy",
      nextAction: "Review triage lock and completion paperwork together.",
      data: {
        serviceLine: "WalMart Tanks",
        customer: "Walmart",
        storeNumber: "2929",
        city: "Hope Mills",
        state: "NC",
        sourceSystem: "gmail:wmtanks",
        workType: "ACC UCO Tank Work",
        workOrderNumber: "GMAIL-WM-2929",
        siteName: "Walmart 2929",
        phase: "Completion Review",
        crewLead: "Trey Turner",
        invoiceStatus: "Review",
        communications: [
          {
            gmailId: "19facbebfce9fd1b",
            subject: "Re: WM 2929 Hope Mills State: North Carolina, AUTO CENTER Tank Triage - Locked 07/28/2026 ACCUCO1",
            sender: "\"'Jotform' via WalMart Tanks Program\" wmtanks@reynaldsbrothers.com",
            sentAt: "2026-07-29T03:20:05-04:00",
            storeNumber: "2929",
            city: "Hope Mills",
            state: "NC",
            matchConfidence: "high",
            displayUrl: "https://mail.google.com/mail/#all/19facbebfce9fd1b",
            attachmentNames: ["6611187470355376504-AUTO-CENTER-Tank-Triage-Locked.pdf"]
          },
          {
            gmailId: "19faafab9c87c029",
            subject: "Re: store: WM 2929 07-28-2026 trey.turner@reynaldsbrothers.com ACC Walmart ACC UCO Work Completion [^]",
            sender: "\"'Jotform' via WalMart Tanks Program\" wmtanks@reynaldsbrothers.com",
            sentAt: "2026-07-28T19:06:22-04:00",
            storeNumber: "2929",
            city: "Hope Mills",
            state: "NC",
            matchConfidence: "high",
            displayUrl: "https://mail.google.com/mail/#all/19faafab9c87c029",
            attachmentNames: ["6610891485785533964_signature_12.png", "2929-Completed-level-2-triage-on-all-tanks.pdf"]
          }
        ]
      }
    },
    {
      id: "rb_wi_wmtanks_920",
      objectType: "rb.work_item",
      name: "WM 920 — Warner Robins UCO Work Completion",
      status: "Completed Documentation",
      health: "Healthy",
      nextAction: "Review completion PDF and date fields before invoice readiness.",
      data: {
        serviceLine: "WalMart Tanks",
        customer: "Walmart",
        storeNumber: "920",
        city: "Warner Robins",
        state: "GA",
        sourceSystem: "gmail:wmtanks",
        workType: "ACC UCO Work Completion",
        workOrderNumber: "GMAIL-WM-920",
        siteName: "Walmart 920",
        phase: "Completion Review",
        crewLead: "Austin Wright",
        invoiceStatus: "Review",
        communications: [
          {
            gmailId: "19fab41f63260a31",
            subject: "Re: store: WM 920 07-28-2026 austin.wright@reynaldsbrothers.com UCO Walmart ACC UCO Work Completion [^]",
            sender: "\"'Jotform' via Walmart Paperwork\" wmpw@reynaldsbrothers.com",
            sentAt: "2026-07-28T20:24:11-04:00",
            storeNumber: "920",
            city: "Warner Robins",
            state: "GA",
            matchConfidence: "high",
            displayUrl: "https://mail.google.com/mail/#all/19fab41f63260a31",
            attachmentNames: ["6610937981866328287_signature_12.png", "920-Removed-old-UCO-unit.pdf"]
          }
        ]
      }
    },
    {
      id: "rb_wi_wmtanks_649",
      objectType: "rb.work_item",
      name: "WM 649 — Titusville ACC UCO Tank Work",
      status: "Completed Documentation",
      health: "Healthy",
      nextAction: "Review triage lock and completion paperwork together.",
      data: {
        serviceLine: "WalMart Tanks",
        customer: "Walmart",
        storeNumber: "649",
        city: "Titusville",
        state: "FL",
        sourceSystem: "gmail:wmtanks",
        workType: "ACC UCO Tank Work",
        workOrderNumber: "GMAIL-WM-649",
        siteName: "Walmart 649",
        phase: "Completion Review",
        crewLead: "Trey Turner",
        invoiceStatus: "Review",
        communications: [
          {
            gmailId: "19faaf0809709e1c",
            subject: "Re: WM 649 Titusville State: Florida, AUTO CENTER Tank Triage - Locked 07/27/2026 ACCUCO1",
            sender: "\"'Jotform' via WalMart Tanks Program\" wmtanks@reynaldsbrothers.com",
            sentAt: "2026-07-28T18:55:12-04:00",
            storeNumber: "649",
            city: "Titusville",
            state: "FL",
            matchConfidence: "high",
            displayUrl: "https://mail.google.com/mail/#all/19faaf0809709e1c",
            attachmentNames: ["6610884545784376167-AUTO-CENTER-Tank-Triage-Locked.pdf"]
          },
          {
            gmailId: "19fa64dfcaaf984d",
            subject: "Re: store: WM 649 07-27-2026 trey.turner@reynaldsbrothers.com ACC Walmart ACC UCO Work Completion [^]",
            sender: "\"'Jotform' via Walmart Paperwork\" wmpw@reynaldsbrothers.com",
            sentAt: "2026-07-27T21:19:12-04:00",
            storeNumber: "649",
            city: "Titusville",
            state: "FL",
            matchConfidence: "high",
            displayUrl: "https://mail.google.com/mail/#all/19fa64dfcaaf984d",
            attachmentNames: ["6610106970837156097_signature_12.png", "649-Completed-level-2-triage-on-all-tanks.pdf"]
          }
        ]
      }
    },
    {
      id: "rb_wi_wmtanks_3402",
      objectType: "rb.work_item",
      name: "WM 3402 — Stockbridge ACC UCO Tank Work",
      status: "Completed Documentation",
      health: "Healthy",
      nextAction: "Review triage lock and completion paperwork together.",
      data: {
        serviceLine: "WalMart Tanks",
        customer: "Walmart",
        storeNumber: "3402",
        city: "Stockbridge",
        state: "GA",
        sourceSystem: "gmail:wmtanks",
        workType: "ACC UCO Tank Work",
        workOrderNumber: "GMAIL-WM-3402",
        siteName: "Walmart 3402",
        phase: "Completion Review",
        crewLead: "Austin Wright",
        invoiceStatus: "Review",
        communications: [
          {
            gmailId: "19fa9a3640ca6323",
            subject: "Re: WM 3402 Stockbridge State: Georgia, AUTO CENTER Tank Triage - Locked 07/28/2026 ACCUCO1",
            sender: "\"'Jotform' via WalMart Tanks Program\" wmtanks@reynaldsbrothers.com",
            sentAt: "2026-07-28T12:51:21-04:00",
            storeNumber: "3402",
            city: "Stockbridge",
            state: "GA",
            matchConfidence: "high",
            displayUrl: "https://mail.google.com/mail/#all/19fa9a3640ca6323",
            attachmentNames: []
          },
          {
            gmailId: "19fa99752dc5e0db",
            subject: "Re: store: WM 3402 07-28-2026 austin.wright@reynaldsbrothers.com ACC Walmart ACC UCO Work Completion [^]",
            sender: "\"'Jotform' via WalMart Tanks Program\" wmtanks@reynaldsbrothers.com",
            sentAt: "2026-07-28T12:38:10-04:00",
            storeNumber: "3402",
            city: "Stockbridge",
            state: "GA",
            matchConfidence: "high",
            displayUrl: "https://mail.google.com/mail/#all/19fa99752dc5e0db",
            attachmentNames: ["6610658315125455517_signature_12.png", "3402-Assessed-all-compliance-issues-with-ACC-oil-tanks.pdf"]
          }
        ]
      }
    },
    {
      id: "rb_wi_wmtanks_4426",
      objectType: "rb.work_item",
      name: "NHM 4426 — Columbus Project Release",
      status: "Released",
      health: "Healthy",
      nextAction: "Confirm production scheduling after project release.",
      data: {
        serviceLine: "WalMart Tanks",
        customer: "Walmart",
        storeNumber: "4426",
        city: "Columbus",
        state: "GA",
        sourceSystem: "gmail:wmtanks",
        workType: "Project Release",
        workOrderNumber: "GMAIL-NHM-4426",
        siteName: "NHM 4426",
        phase: "Released for Production",
        crewLead: "John Nester",
        invoiceStatus: "Not Ready",
        communications: [
          {
            gmailId: "19fa8e6640b15366",
            subject: "NHM 4426 Columbus, GA -PROJECT RELEASE",
            sender: "John Nester john.nester@reynaldsbrothers.com",
            sentAt: "2026-07-28T09:24:44-04:00",
            storeNumber: "4426",
            city: "Columbus",
            state: "GA",
            matchConfidence: "high",
            displayUrl: "https://mail.google.com/mail/#all/19fa8e6640b15366",
            attachmentNames: []
          }
        ]
      }
    },
    {
      id: "rb_wi_wmtanks_1494",
      objectType: "rb.work_item",
      name: "WM 1494 — Corpus Christi ACC Tank Replacement",
      status: "Workflow Updated",
      health: "Attention",
      nextAction: "Review LxRetail workflow update and uploaded documents.",
      data: {
        serviceLine: "WalMart Tanks",
        customer: "Walmart",
        storeNumber: "1494",
        city: "Corpus Christi",
        state: "TX",
        sourceSystem: "gmail:wmtanks",
        workType: "ACC Tank Replacement",
        workOrderNumber: "1494.1018",
        siteName: "Walmart 1494",
        phase: "Workflow Updated",
        crewLead: null,
        invoiceStatus: "Not Ready",
        communications: [
          {
            gmailId: "19fa57abc86f5567",
            subject: "[LxRetail] 1494.1018 Corpus Christi TX ACC Tank Replacement Workflow Updated",
            sender: "Walmart via WalMart Tanks Program wmtanks@reynaldsbrothers.com",
            sentAt: "2026-07-27T16:28:28-05:00",
            storeNumber: "1494",
            workOrderNumber: "1494.1018",
            city: "Corpus Christi",
            state: "TX",
            matchConfidence: "high",
            displayUrl: "https://mail.google.com/mail/#all/19fa57abc86f5567",
            attachmentNames: []
          }
        ]
      }
    },
    {
      id: "rb_wi_wmtanks_1068",
      objectType: "rb.work_item",
      name: "WM 1068 — Sebastian ACC Tank Replacement",
      status: "Workflow Updated",
      health: "Attention",
      nextAction: "Review uploaded LxRetail pre-construction permit documents.",
      data: {
        serviceLine: "WalMart Tanks",
        customer: "Walmart",
        storeNumber: "1068",
        city: "Sebastian",
        state: "FL",
        sourceSystem: "gmail:wmtanks",
        workType: "ACC Tank Replacement",
        workOrderNumber: "1068.1017",
        siteName: "Walmart 1068",
        phase: "Workflow Updated",
        crewLead: null,
        invoiceStatus: "Not Ready",
        communications: [
          {
            gmailId: "19e50d6d9ce5bd80",
            threadId: "19e50d6d9ce5bd80",
            subject: "[LxRetail] 1068.1017 Sebastian FL ACC Tank Replacement Workflow Updated",
            sender: "Walmart via WalMart Tanks Program wmtanks@reynaldsbrothers.com",
            sentAt: "2026-05-22T17:58:34",
            storeNumber: "1068",
            workOrderNumber: "1068.1017",
            city: "Sebastian",
            state: "FL",
            matchConfidence: "high",
            displayUrl: "https://mail.google.com/mail/#all/19e50d6d9ce5bd80",
            attachmentNames: []
          }
        ]
      }
    },
    {
      id: "rb_wi_wmtanks_2214",
      objectType: "rb.work_item",
      name: "WM 2214 — Columbia Permit Coordination",
      status: "Permit Coordination",
      health: "Attention",
      nextAction: "Confirm permitting requirements for the 105-gallon used motor oil tank install.",
      data: {
        serviceLine: "WalMart Tanks",
        customer: "Walmart",
        storeNumber: "2214",
        city: "Columbia",
        state: "SC",
        sourceSystem: "gmail:wmtanks",
        workType: "Permit Coordination",
        workOrderNumber: "GMAIL-WM-2214",
        siteName: "Walmart 2214",
        phase: "Permit Coordination",
        crewLead: "Skip Zabel",
        invoiceStatus: "Not Ready",
        communications: [
          {
            gmailId: "19e50a0a8eff5a23",
            threadId: "19e50a0a8eff5a23",
            subject: "Ref Walmart 2214 at 5420 Forest dr.",
            sender: "Skip Zabel skip@reynaldsbrothers.com",
            sentAt: "2026-05-22T16:59:11",
            storeNumber: "2214",
            city: "Columbia",
            state: "SC",
            matchConfidence: "medium",
            displayUrl: "https://mail.google.com/mail/#all/19e50a0a8eff5a23",
            attachmentNames: ["WM 2214 DIY at site.pdf"]
          }
        ]
      }
    },
    {
      id: "rb_wi_wmtanks_5480",
      objectType: "rb.work_item",
      name: "WM 5480 — Round Rock Tank Scope",
      status: "Scope Clarification",
      health: "Attention",
      nextAction: "Confirm DIY tank size correction and Lx scope update.",
      data: {
        serviceLine: "WalMart Tanks",
        customer: "Walmart",
        storeNumber: "5480",
        city: "Round Rock",
        state: "TX",
        sourceSystem: "gmail:wmtanks",
        workType: "Tank Scope Clarification",
        workOrderNumber: "338091191",
        siteName: "Walmart 5480",
        phase: "Scope Clarification",
        crewLead: "John Nester",
        invoiceStatus: "Not Ready",
        communications: [
          {
            gmailId: "19e64e2128566437",
            threadId: "19e5015789a1cc66",
            subject: "Re: WM 5480 Round Rock, TX",
            sender: "Krenz, Krista krista.krenz@aptim.com",
            sentAt: "2026-05-26T15:23:01",
            storeNumber: "5480",
            workOrderNumber: "338091191",
            city: "Round Rock",
            state: "TX",
            matchConfidence: "high",
            displayUrl: "https://mail.google.com/mail/#all/19e64e2128566437",
            attachmentNames: []
          },
          {
            gmailId: "19e27182a3f9a151",
            threadId: "19e27182a3f9a151",
            subject: "WM 5480 Round Rock, TX -PROJECT RELEASE",
            sender: "John Nester john.nester@reynaldsbrothers.com",
            sentAt: "2026-05-14T15:25:43",
            storeNumber: "5480",
            city: "Round Rock",
            state: "TX",
            matchConfidence: "high",
            displayUrl: "https://mail.google.com/mail/#all/19e27182a3f9a151",
            attachmentNames: []
          }
        ]
      }
    },
    {
      id: "rb_wi_wmtanks_471",
      objectType: "rb.work_item",
      name: "WM 471 — Lancaster Permit Valuation",
      status: "Permit Valuation",
      health: "Attention",
      nextAction: "Keep tank/material valuation, custom drawings, and non-standard tank order together with the permit record.",
      data: {
        serviceLine: "WalMart Tanks",
        customer: "Walmart",
        storeNumber: "471",
        city: "Lancaster",
        state: "TX",
        sourceSystem: "gmail:wmtanks",
        workType: "Permit Valuation",
        workOrderNumber: "GMAIL-WM-471",
        siteName: "Walmart 471",
        phase: "Permit Valuation",
        crewLead: "Skip Zabel",
        invoiceStatus: "Not Ready",
        communications: [
          {
            gmailId: "19e50830ed624fe8",
            threadId: "19de47955513ac59",
            subject: "Re: #External - Ref. Walmart 471 at 150 North Interstate 35 east.",
            sender: "Skip Zabel skip@reynaldsbrothers.com",
            sentAt: "2026-05-21T20:48:04",
            storeNumber: "471",
            city: "Lancaster",
            state: "TX",
            matchConfidence: "medium",
            displayUrl: "https://mail.google.com/mail/#all/19e50830ed624fe8",
            attachmentNames: []
          },
          {
            gmailId: "19c9223f1a99b1e8",
            threadId: "19c7c7bf4d1414ab",
            subject: "RE: WM 471 Lancaster TX - Non Standard Order",
            sender: "Dave Dooley via WalMart Tanks Program wmtanks@reynaldsbrothers.com",
            sentAt: "2026-02-25T00:12:27",
            storeNumber: "471",
            city: "Lancaster",
            state: "TX",
            matchConfidence: "high",
            displayUrl: "https://mail.google.com/mail/#all/19c9223f1a99b1e8",
            attachmentNames: ["Custom 500 Gal WM Tank (85 x 27 x 66).pdf", "Custom 280 Gal WM Tank (79 x 27 x 42).pdf"]
          }
        ]
      }
    },
    {
      id: "rb_wi_wmtanks_5094",
      objectType: "rb.work_item",
      name: "NHM 5094 — Houston PAP Notification",
      status: "PAP Review",
      health: "Healthy",
      nextAction: "Review PAP, drawing package, DPR attachments, and project/PO status.",
      data: {
        serviceLine: "WalMart Tanks",
        customer: "Walmart",
        storeNumber: "5094",
        city: "Houston",
        state: "TX",
        sourceSystem: "gmail:wmtanks",
        workType: "PAP Notification",
        workOrderNumber: "5094.1008",
        siteName: "NHM 5094",
        phase: "PAP Review",
        crewLead: null,
        invoiceStatus: "Not Ready",
        communications: [
          {
            gmailId: "19e4c4bc5ddc0f8c",
            threadId: "19e4c4bc5ddc0f8c",
            subject: "FW: Walmart Neighborhood Market #5094 Houston, TX PAP Notification",
            sender: "WalMart Tanks Program wmtanks@reynaldsbrothers.com",
            sentAt: "2026-05-21T20:48:04",
            storeNumber: "5094",
            city: "Houston",
            state: "TX",
            matchConfidence: "high",
            displayUrl: "https://mail.google.com/mail/#all/19e4c4bc5ddc0f8c",
            attachmentNames: ["05094.2026.05.14.TX.UCO.PAP.pdf", "05094.2026.05.14.TX.UCO.DwgPkg.pdf", "05094.2026.05.14.TX.UCO.DPR.pdf"]
          },
          {
            gmailId: "19e665c3c1eb2622",
            threadId: "19df9ec59813e465",
            subject: "RE: NHM Store 5094 Houston, TX - Used Cooking Oil Tank Replacement",
            sender: "Timothy Kimes via WalMart Tanks Program wmtanks@reynaldsbrothers.com",
            sentAt: "2026-05-26T22:16:09",
            storeNumber: "5094",
            workOrderNumber: "5094.1008",
            city: "Houston",
            state: "TX",
            matchConfidence: "high",
            displayUrl: "https://mail.google.com/mail/#all/19e665c3c1eb2622",
            attachmentNames: []
          }
        ]
      }
    },
    {
      id: "rb_wi_wmtanks_3296",
      objectType: "rb.work_item",
      name: "WM 3296 — Houston ACC Tank Replacement",
      status: "Permitting Information",
      health: "Attention",
      nextAction: "Keep DIY tank clarification with the LxRetail workflow update.",
      data: {
        serviceLine: "WalMart Tanks",
        customer: "Walmart",
        storeNumber: "3296",
        city: "Houston",
        state: "TX",
        sourceSystem: "gmail:wmtanks",
        workType: "ACC Tank Replacement",
        workOrderNumber: "3296.1016",
        siteName: "Walmart 3296",
        phase: "Permitting Information",
        crewLead: "Shay Reynalds",
        invoiceStatus: "Not Ready",
        communications: [
          {
            gmailId: "19e4c010375d0984",
            threadId: "19e4c010375d0984",
            subject: "[LxRetail] 3296.1016 Houston TX ACC Tank Replacement Workflow Updated",
            sender: "Walmart via WalMart Tanks Program wmtanks@reynaldsbrothers.com",
            sentAt: "2026-05-21T19:26:32",
            storeNumber: "3296",
            workOrderNumber: "3296.1016",
            city: "Houston",
            state: "TX",
            matchConfidence: "high",
            displayUrl: "https://mail.google.com/mail/#all/19e4c010375d0984",
            attachmentNames: []
          },
          {
            gmailId: "19e4bec1be20a2cb",
            threadId: "19e4bcfa25474f61",
            subject: "RE: FW: 3296 Houston, TX ACC tank replacement",
            sender: "Krenz, Krista krista.krenz@aptim.com",
            sentAt: "2026-05-21T19:03:37",
            storeNumber: "3296",
            city: "Houston",
            state: "TX",
            matchConfidence: "high",
            displayUrl: "https://mail.google.com/mail/#all/19e4bec1be20a2cb",
            attachmentNames: []
          }
        ]
      }
    },
    {
      id: "rb_wi_wmtanks_1168",
      objectType: "rb.work_item",
      name: "WM 1168 — Columbia ACC UCO Completion",
      status: "Completed Documentation",
      health: "Healthy",
      nextAction: "Review completion packet and level 2 triage PDF.",
      data: {
        serviceLine: "WalMart Tanks",
        customer: "Walmart",
        storeNumber: "1168",
        city: "Columbia",
        state: "MS",
        sourceSystem: "gmail:wmtanks",
        workType: "ACC UCO Work Completion",
        workOrderNumber: "GMAIL-WM-1168",
        siteName: "Walmart 1168",
        phase: "Completion Review",
        crewLead: "Trey Turner",
        invoiceStatus: "Review",
        communications: [
          {
            gmailId: "19e4bcc9f5318b82",
            threadId: "19e4bcc9f5318b82",
            subject: "Re: store: WM 1168 05-21-2026 trey.turner@reynaldsbrothers.com ACC Walmart ACC UCO Work Completion [^]",
            sender: "Jotform via WalMart Tanks Program wmtanks@reynaldsbrothers.com",
            sentAt: "2026-05-21T18:29:18",
            storeNumber: "1168",
            city: "Columbia",
            state: "MS",
            matchConfidence: "high",
            displayUrl: "https://mail.google.com/mail/#all/19e4bcc9f5318b82",
            attachmentNames: ["6551973170016327098_signature_12.png", "1168-Completed-level-2-triage-on-all-tanks.pdf"]
          }
        ]
      }
    },
    {
      id: "rb_wi_wmtanks_1540",
      objectType: "rb.work_item",
      name: "WM 1540 — South Haven Pressure Washing",
      status: "Scheduled",
      health: "Healthy",
      nextAction: "Confirm ACC manager contact and lower bay access for the scheduled wash.",
      data: {
        serviceLine: "WalMart Tanks",
        customer: "Walmart",
        storeNumber: "1540",
        city: "South Haven",
        state: "MI",
        sourceSystem: "gmail:wmtanks",
        workType: "Pressure Washing",
        workOrderNumber: "GMAIL-WM-1540",
        siteName: "Walmart 1540",
        phase: "Scheduled",
        crewLead: "Shay Reynalds",
        invoiceStatus: "Not Ready",
        communications: [
          {
            gmailId: "19e4be2cdefc64be",
            threadId: "19cbe187edd745fc",
            subject: "Re: 1540 South Haven, MI - pressure washing needed",
            sender: "Shay Reynalds shay@reynaldsbrothers.com",
            sentAt: "2026-05-21T18:52:55",
            storeNumber: "1540",
            city: "South Haven",
            state: "MI",
            matchConfidence: "high",
            displayUrl: "https://mail.google.com/mail/#all/19e4be2cdefc64be",
            attachmentNames: []
          }
        ]
      }
    },
    {
      id: "rb_wi_wmtanks_3425",
      objectType: "rb.work_item",
      name: "WM 3425 — Houston Project Release",
      status: "Released",
      health: "Healthy",
      nextAction: "Move to production with no Houston permit or inspection requirement.",
      data: {
        serviceLine: "WalMart Tanks",
        customer: "Walmart",
        storeNumber: "3425",
        city: "Houston",
        state: "TX",
        sourceSystem: "gmail:wmtanks",
        workType: "Project Release",
        workOrderNumber: "GMAIL-WM-3425",
        siteName: "Walmart 3425",
        phase: "Released for Production",
        crewLead: "Skip Zabel",
        invoiceStatus: "Not Ready",
        communications: [
          {
            gmailId: "19e2bfceaa19df24",
            threadId: "19e2bfceaa19df24",
            subject: "WM 3425 Houston TX, PROJECT RELEASE",
            sender: "Skip Zabel skip@reynaldsbrothers.com",
            sentAt: "2026-05-15T14:14:03",
            storeNumber: "3425",
            city: "Houston",
            state: "TX",
            matchConfidence: "high",
            displayUrl: "https://mail.google.com/mail/#all/19e2bfceaa19df24",
            attachmentNames: []
          }
        ]
      }
    },
    {
      id: "rb_wi_wmtanks_458",
      objectType: "rb.work_item",
      name: "WM 458 — Aransas Pass Plans and Specs",
      status: "Plans and Specs",
      health: "Attention",
      nextAction: "Keep plans/spec requests and APTIM replies attached to the store card.",
      data: {
        serviceLine: "WalMart Tanks",
        customer: "Walmart",
        storeNumber: "458",
        city: "Aransas Pass",
        state: "TX",
        sourceSystem: "gmail:wmtanks",
        workType: "Plans and Specs",
        workOrderNumber: "GMAIL-WM-458",
        siteName: "Walmart 458",
        phase: "Plans and Specs",
        crewLead: "Skip Zabel",
        invoiceStatus: "Not Ready",
        communications: [
          {
            gmailId: "19e2d44b18550873",
            threadId: "19e2be9291254a97",
            subject: "Re: Ref WM 458 Aransas Pass. docs needed",
            sender: "Skip Zabel skip@reynaldsbrothers.com",
            sentAt: "2026-05-15T20:12:02",
            storeNumber: "458",
            city: "Aransas Pass",
            state: "TX",
            matchConfidence: "medium",
            displayUrl: "https://mail.google.com/mail/#all/19e2d44b18550873",
            attachmentNames: []
          },
          {
            gmailId: "19e2ddee0ef9b7d0",
            threadId: "19e283de8095ca0b",
            subject: "Re: WM 458 Plans and specs",
            sender: "Skip Zabel skip@reynaldsbrothers.com",
            sentAt: "2026-05-15T23:00:27",
            storeNumber: "458",
            matchConfidence: "medium",
            displayUrl: "https://mail.google.com/mail/#all/19e2ddee0ef9b7d0",
            attachmentNames: []
          }
        ]
      }
    },
    {
      id: "rb_wi_wmtanks_814",
      objectType: "rb.work_item",
      name: "WM 814 — Okeechobee ACC Tank Replacement",
      status: "Workflow Updated",
      health: "Attention",
      nextAction: "Tie the LCR/registration thread to the LxRetail workflow documents.",
      data: {
        serviceLine: "WalMart Tanks",
        customer: "Walmart",
        storeNumber: "814",
        city: "Okeechobee",
        state: "FL",
        sourceSystem: "gmail:wmtanks",
        workType: "ACC Tank Replacement",
        workOrderNumber: "814.1014",
        siteName: "Walmart 814",
        phase: "Workflow Updated",
        crewLead: "Skip Zabel",
        invoiceStatus: "Not Ready",
        communications: [
          {
            gmailId: "19e2be48d9c266b7",
            threadId: "19e1d738ea2b9c89",
            subject: "Re: FW: Ref. 814 Okeechobee, 174 Cocoa, 551 Palatka",
            sender: "Skip Zabel skip@reynaldsbrothers.com",
            sentAt: "2026-05-15T13:47:24",
            storeNumber: "814",
            city: "Okeechobee",
            state: "FL",
            matchConfidence: "medium",
            displayUrl: "https://mail.google.com/mail/#all/19e2be48d9c266b7",
            attachmentNames: []
          },
          {
            gmailId: "19e286752eb5ef19",
            threadId: "19e286752eb5ef19",
            subject: "[LxRetail] 814.1014 Okeechobee FL ACC Tank Replacement Workflow Updated",
            sender: "Walmart via WalMart Tanks Program wmtanks@reynaldsbrothers.com",
            sentAt: "2026-05-14T21:31:57",
            storeNumber: "814",
            workOrderNumber: "814.1014",
            city: "Okeechobee",
            state: "FL",
            matchConfidence: "high",
            displayUrl: "https://mail.google.com/mail/#all/19e286752eb5ef19",
            attachmentNames: []
          }
        ]
      }
    },
    {
      id: "rb_wi_wmtanks_1621",
      objectType: "rb.work_item",
      name: "WM 1621 — Laurel Pump Out Coordination",
      status: "Pump Out Scheduled",
      health: "Healthy",
      nextAction: "Confirm Safety-Kleen service timing for the tank replacement day.",
      data: {
        serviceLine: "WalMart Tanks",
        customer: "Walmart",
        storeNumber: "1621",
        city: "Laurel",
        state: "MS",
        sourceSystem: "gmail:wmtanks",
        workType: "Pump Out Coordination",
        workOrderNumber: "GMAIL-WM-1621",
        siteName: "Walmart 1621",
        phase: "Pump Out Scheduled",
        crewLead: "Jeremiah Reynalds",
        invoiceStatus: "Not Ready",
        communications: [
          {
            gmailId: "19e3be57d0d0650e",
            threadId: "19e2bb1ed313e946",
            subject: "RE: wm 1621 Laurel MS Pump OutRequest",
            sender: "WMServices WMServices@safety-kleen.com",
            sentAt: "2026-05-18T16:20:59",
            storeNumber: "1621",
            city: "Laurel",
            state: "MS",
            matchConfidence: "high",
            displayUrl: "https://mail.google.com/mail/#all/19e3be57d0d0650e",
            attachmentNames: []
          }
        ]
      }
    },
    {
      id: "rb_wi_wmtanks_0533",
      objectType: "rb.work_item",
      name: "WM 0533 — New Iberia Pump Out Coordination",
      status: "Pump Out Scheduled",
      health: "Healthy",
      nextAction: "Confirm final stop timing and crew coordination for 05/20 service.",
      data: {
        serviceLine: "WalMart Tanks",
        customer: "Walmart",
        storeNumber: "0533",
        city: "New Iberia",
        state: "LA",
        sourceSystem: "gmail:wmtanks",
        workType: "Pump Out Coordination",
        workOrderNumber: "GMAIL-WM-0533",
        siteName: "Walmart 0533",
        phase: "Pump Out Scheduled",
        crewLead: "Jeremiah Reynalds",
        invoiceStatus: "Not Ready",
        communications: [
          {
            gmailId: "19e3be523fb72b9b",
            threadId: "19e2bb6db1e2aa4c",
            subject: "RE: Wm 0533 New Iberia LA Pump Out Request",
            sender: "WMServices WMServices@safety-kleen.com",
            sentAt: "2026-05-18T16:22:05",
            storeNumber: "0533",
            city: "New Iberia",
            state: "LA",
            matchConfidence: "high",
            displayUrl: "https://mail.google.com/mail/#all/19e3be523fb72b9b",
            attachmentNames: []
          }
        ]
      }
    },
    {
      id: "rb_wi_wmtanks_4621",
      objectType: "rb.work_item",
      name: "WM 4621 — Jacksonville AST Testing",
      status: "Invoice Follow-Up",
      health: "Attention",
      nextAction: "Confirm invoice receipt and keep amended AST testing forms with the card.",
      data: {
        serviceLine: "WalMart Tanks",
        customer: "Walmart",
        storeNumber: "4621",
        city: "Jacksonville",
        state: "FL",
        sourceSystem: "gmail:wmtanks",
        workType: "AST Testing",
        workOrderNumber: "GMAIL-WM-4621",
        siteName: "Walmart 4621",
        phase: "Invoice Follow-Up",
        crewLead: "Shay Reynalds",
        invoiceStatus: "Review",
        communications: [
          {
            gmailId: "19e889247004e8e1",
            threadId: "19e2ba857c60822a",
            subject: "Re: Walmart 4621 Jacksonville / 800 gal AST testing",
            sender: "Shay Reynalds shay@reynaldsbrothers.com",
            sentAt: "2026-06-02T13:41:48",
            storeNumber: "4621",
            city: "Jacksonville",
            state: "FL",
            matchConfidence: "medium",
            displayUrl: "https://mail.google.com/mail/#all/19e889247004e8e1",
            attachmentNames: []
          }
        ]
      }
    },
    {
      id: "rb_wi_wmtanks_211",
      objectType: "rb.work_item",
      name: "WM 211 — Hillsboro Tank Observations",
      status: "Observation Resolved",
      health: "Healthy",
      nextAction: "Retain new gauge photo confirmation with the observation thread.",
      data: {
        serviceLine: "WalMart Tanks",
        customer: "Walmart",
        storeNumber: "211",
        city: "Hillsboro",
        state: "TX",
        sourceSystem: "gmail:wmtanks",
        workType: "Tank Observations",
        workOrderNumber: "GMAIL-WM-211",
        siteName: "Walmart 211",
        phase: "Observation Resolved",
        crewLead: "Darren Fielder",
        invoiceStatus: "Not Ready",
        communications: [
          {
            gmailId: "19e283f597dd9661",
            threadId: "19d7900774ff1999",
            subject: "RE: FW: WM Store # 211 Hillsboro TX Tank Observations",
            sender: "Krenz, Krista krista.krenz@aptim.com",
            sentAt: "2026-05-14T20:48:17",
            storeNumber: "211",
            city: "Hillsboro",
            state: "TX",
            matchConfidence: "high",
            displayUrl: "https://mail.google.com/mail/#all/19e283f597dd9661",
            attachmentNames: []
          }
        ]
      }
    },
    {
      id: "rb_wi_wmtanks_551",
      objectType: "rb.work_item",
      name: "WM 551 — Palatka ACC UCO Completion",
      status: "Completed Documentation",
      health: "Healthy",
      nextAction: "Review edited completion packet and original Jotform packet together.",
      data: {
        serviceLine: "WalMart Tanks",
        customer: "Walmart",
        storeNumber: "551",
        city: "Palatka",
        state: "FL",
        sourceSystem: "gmail:wmtanks",
        workType: "ACC UCO Work Completion",
        workOrderNumber: "GMAIL-WM-551",
        siteName: "Walmart 551",
        phase: "Completion Review",
        crewLead: "Austin Wright",
        invoiceStatus: "Review",
        communications: [
          {
            gmailId: "19e27cf8bd21a83c",
            threadId: "19e27cf8bd21a83c",
            subject: "EDIT: Re: store: WM 551 05-14-2026 austin.wright@reynaldsbrothers.com ACC Walmart ACC UCO Work Completion [^]",
            sender: "Jotform via Walmart Paperwork wmpw@reynaldsbrothers.com",
            sentAt: "2026-05-14T18:46:09",
            storeNumber: "551",
            city: "Palatka",
            state: "FL",
            matchConfidence: "high",
            displayUrl: "https://mail.google.com/mail/#all/19e27cf8bd21a83c",
            attachmentNames: ["6545932940325567380_signature_12.png", "551-Removed-all-old-ACC-oil-tanks-Waste-5-20-5-30-DIY-Filter-Crusher.pdf"]
          },
          {
            gmailId: "19e27cdae4cc5702",
            threadId: "19e27cdae4cc5702",
            subject: "Re: store: WM 551 05-14-2026 austin.wright@reynaldsbrothers.com ACC Walmart ACC UCO Work Completion [^]",
            sender: "Jotform via Walmart Paperwork wmpw@reynaldsbrothers.com",
            sentAt: "2026-05-14T18:44:08",
            storeNumber: "551",
            city: "Palatka",
            state: "FL",
            matchConfidence: "high",
            displayUrl: "https://mail.google.com/mail/#all/19e27cdae4cc5702",
            attachmentNames: ["6545932940325567380_signature_12.png", "551-Removed-all-old-ACC-oil-tanks-Waste-5-20-5-30-DIY-Filter-Crusher.pdf"]
          }
        ]
      }
    },
    {
      id: "rb_wi_wmtanks_4857",
      objectType: "rb.work_item",
      name: "WM 4857 — Cape Coral UCO Completion",
      status: "Completed Documentation",
      health: "Healthy",
      nextAction: "Review UCO completion packet and Frontline tank replacement PDF.",
      data: {
        serviceLine: "WalMart Tanks",
        customer: "Walmart",
        storeNumber: "4857",
        city: "Cape Coral",
        state: "FL",
        sourceSystem: "gmail:wmtanks",
        workType: "UCO Work Completion",
        workOrderNumber: "GMAIL-WM-4857",
        siteName: "Walmart 4857",
        phase: "Completion Review",
        crewLead: "Austin Wright",
        invoiceStatus: "Review",
        communications: [
          {
            gmailId: "19dfe4d5bb79e93c",
            threadId: "19dfe4d5bb79e93c",
            subject: "Re: store: WM 4857 05-06-2026 austin.wright@reynaldsbrothers.com UCO Walmart ACC UCO Work Completion [^]",
            sender: "Jotform via WalMart Tanks Program wmtanks@reynaldsbrothers.com",
            sentAt: "2026-05-06T17:19:32",
            storeNumber: "4857",
            city: "Cape Coral",
            state: "FL",
            matchConfidence: "high",
            displayUrl: "https://mail.google.com/mail/#all/19dfe4d5bb79e93c",
            attachmentNames: ["6538971238575887054_signature_12.png", "4857-Removed-old-Frontline-UCO-tank.pdf"]
          }
        ]
      }
    },
    {
      id: "rb_wi_wmtanks_582",
      objectType: "rb.work_item",
      name: "WM 582 — Port Orange Tank Testing / EQ",
      status: "EQ / Testing Follow-Up",
      health: "Attention",
      nextAction: "Keep FDEP EQ number and tank testing follow-up with the store card.",
      data: {
        serviceLine: "WalMart Tanks",
        customer: "Walmart",
        storeNumber: "582",
        city: "Port Orange",
        state: "FL",
        sourceSystem: "gmail:wmtanks",
        workType: "Tank Testing / EQ",
        workOrderNumber: "GMAIL-WM-582",
        siteName: "Walmart 582",
        phase: "EQ / Testing Follow-Up",
        crewLead: "Skip Zabel",
        invoiceStatus: "Not Ready",
        communications: [
          {
            gmailId: "19e2714999b23784",
            threadId: "19dfe38e93dab263",
            subject: "RE: FW: 9805751 WAL-MART SUPERCENTER #582",
            sender: "Krenz, Krista krista.krenz@aptim.com",
            sentAt: "2026-05-14T15:21:55",
            storeNumber: "582",
            city: "Port Orange",
            state: "FL",
            matchConfidence: "high",
            displayUrl: "https://mail.google.com/mail/#all/19e2714999b23784",
            attachmentNames: []
          },
          {
            gmailId: "19e27cf4e84e46b6",
            threadId: "19e270bd8d705367",
            subject: "Re: Ref. WM Port Orange FL. EQ Number",
            sender: "Kidder, Matthew Matthew.Kidder@ocfl.net",
            sentAt: "2026-05-14T18:45:51",
            storeNumber: "582",
            city: "Port Orange",
            state: "FL",
            matchConfidence: "medium",
            displayUrl: "https://mail.google.com/mail/#all/19e27cf4e84e46b6",
            attachmentNames: []
          }
        ]
      }
    },
    {
      id: "rb_wi_wmtanks_6364",
      objectType: "rb.work_item",
      name: "WM 6364 — Naples UCO Completion",
      status: "Completed Documentation",
      health: "Healthy",
      nextAction: "Review UCO completion packet and serial numbers before invoice readiness.",
      data: {
        serviceLine: "WalMart Tanks",
        customer: "Walmart",
        storeNumber: "6364",
        city: "Naples",
        state: "FL",
        sourceSystem: "gmail:wmtanks",
        workType: "UCO Work Completion",
        workOrderNumber: "GMAIL-WM-6364",
        siteName: "Walmart 6364",
        phase: "Completion Review",
        crewLead: "Austin Wright",
        invoiceStatus: "Review",
        communications: [
          {
            gmailId: "19df97eee56a2234",
            threadId: "19df97eee56a2234",
            subject: "Re: store: WM 6364 05-05-2026 austin.wright@reynaldsbrothers.com UCO Walmart ACC UCO Work Completion [^]",
            sender: "Jotform via Walmart Paperwork wmpw@reynaldsbrothers.com",
            sentAt: "2026-05-05T18:55:35",
            storeNumber: "6364",
            city: "Naples",
            state: "FL",
            matchConfidence: "high",
            displayUrl: "https://mail.google.com/mail/#all/19df97eee56a2234",
            attachmentNames: ["6538164958573720404_signature_12.png", "6364-Removed-old-Frontline-UCO-tank.pdf"]
          }
        ]
      }
    },
    {
      id: "rb_wi_wmtanks_7658",
      objectType: "rb.work_item",
      name: "WM 7658 — Brunswick UCO Completion",
      status: "Completed Documentation",
      health: "Healthy",
      nextAction: "Review completion packet, serial numbers, and removed-tank PDF.",
      data: {
        serviceLine: "WalMart Tanks",
        customer: "Walmart",
        storeNumber: "7658",
        city: "Brunswick",
        state: "GA",
        sourceSystem: "gmail:wmtanks",
        workType: "UCO Work Completion",
        workOrderNumber: "GMAIL-WM-7658",
        siteName: "Walmart 7658",
        phase: "Completion Review",
        crewLead: "Austin Wright",
        invoiceStatus: "Review",
        communications: [
          {
            gmailId: "19dc7af0e06c252c",
            threadId: "19dc7af0e06c252c",
            subject: "Re: store: WM 7658 04-25-2026 austin.wright@reynaldsbrothers.com UCO Walmart ACC UCO Work Completion [^]",
            sender: "Jotform via WalMart Tanks Program wmtanks@reynaldsbrothers.com",
            sentAt: "2026-04-26T02:47:07",
            storeNumber: "7658",
            city: "Brunswick",
            state: "GA",
            matchConfidence: "high",
            displayUrl: "https://mail.google.com/mail/#all/19dc7af0e06c252c",
            attachmentNames: ["6529807885641883835_signature_12.png", "7658-Removed-old-UCO-tank.pdf"]
          }
        ]
      }
    },
    {
      id: "rb_wi_wmtanks_3702",
      objectType: "rb.work_item",
      name: "WM 3702 — Jacksonville ACC Hydraulic Lines",
      status: "Completed Documentation",
      health: "Healthy",
      nextAction: "Review hydraulic-line completion plus earlier leak-diagnosis packet before invoice readiness.",
      data: {
        serviceLine: "WalMart Tanks",
        customer: "Walmart",
        storeNumber: "3702",
        city: "Jacksonville",
        state: "FL",
        sourceSystem: "gmail:wmtanks",
        workType: "ACC Work Completion",
        workOrderNumber: "GMAIL-WM-3702",
        siteName: "Walmart 3702",
        phase: "Completion Review",
        crewLead: "Austin Wright",
        invoiceStatus: "Review",
        communications: [
          {
            gmailId: "19dc5c81fa4f2920",
            threadId: "19dc5c81fa4f2920",
            subject: "Re: store: WM 3702 04-25-2026 austin.wright@reynaldsbrothers.com ACC Walmart ACC UCO Work Completion [^]",
            sender: "Jotform via Walmart Paperwork wmpw@reynaldsbrothers.com",
            sentAt: "2026-04-25T17:55:16",
            storeNumber: "3702",
            city: "Jacksonville",
            state: "FL",
            matchConfidence: "high",
            displayUrl: "https://mail.google.com/mail/#all/19dc5c81fa4f2920",
            attachmentNames: ["6529488905641327253_signature_12.png", "3702-Removed-old-Hydraulic-lines-from-5-20-5-30-bulk-oil-tanks.pdf"]
          },
          {
            gmailId: "19d7d46b51902535",
            threadId: "19d7d46b51902535",
            subject: "Re: store: WM 3702 04-11-2026 austin.wright@reynaldsbrothers.com ACC Walmart ACC UCO Work Completion [^]",
            sender: "Jotform via WalMart Tanks Program wmtanks@reynaldsbrothers.com",
            sentAt: "2026-04-11T16:01:14",
            storeNumber: "3702",
            city: "Jacksonville",
            state: "FL",
            matchConfidence: "high",
            displayUrl: "https://mail.google.com/mail/#all/19d7d46b51902535",
            attachmentNames: ["6517324254215215296_signature_55.png", "6517324254215215296_signature_12.png", "3702-Investigated-and-diagnosed-possible-oil-leak-locations-and-causes-on-5-30-and-5-20-oil-tank-pumps.pdf"]
          }
        ]
      }
    },
    {
      id: "rb_wi_wmtanks_1283",
      objectType: "rb.work_item",
      name: "WM 1283 — Starke ACC UCO Completion",
      status: "Completed Documentation",
      health: "Healthy",
      nextAction: "Review completion packet covering all removed and installed ACC oil tanks.",
      data: {
        serviceLine: "WalMart Tanks",
        customer: "Walmart",
        storeNumber: "1283",
        city: "Starke",
        state: "FL",
        sourceSystem: "gmail:wmtanks",
        workType: "ACC/UCO Work Completion",
        workOrderNumber: "GMAIL-WM-1283",
        siteName: "Walmart 1283",
        phase: "Completion Review",
        crewLead: "Austin Wright",
        invoiceStatus: "Review",
        communications: [
          {
            gmailId: "19dc1a8763cdb8af",
            threadId: "19dc1a8763cdb8af",
            subject: "Re: store: WM 1283 04-24-2026 austin.wright@reynaldsbrothers.com ACC Walmart ACC UCO Work Completion [^]",
            sender: "Jotform via WalMart Tanks Program wmtanks@reynaldsbrothers.com",
            sentAt: "2026-04-24T22:42:13",
            storeNumber: "1283",
            city: "Starke",
            state: "FL",
            matchConfidence: "high",
            displayUrl: "https://mail.google.com/mail/#all/19dc1a8763cdb8af",
            attachmentNames: ["6528796795028845978_signature_12.png", "1283-Removed-all-old-ACC-oil-tanks-Waste-5-30-5-20-DIY-Filter-Crusher.pdf"]
          }
        ]
      }
    },
    {
      id: "rb_wi_wmtanks_4702",
      objectType: "rb.work_item",
      name: "SC 4702 — Friendswood Project Release",
      status: "Released for Production",
      health: "Healthy",
      nextAction: "Move released project into production while tracking the larger UCO tank install schedule/photos.",
      data: {
        serviceLine: "WalMart Tanks",
        customer: "Walmart",
        storeNumber: "4702",
        city: "Friendswood",
        state: "TX",
        sourceSystem: "gmail:wmtanks",
        workType: "Project Release",
        workOrderNumber: "GMAIL-SC-4702",
        siteName: "Sam's Club 4702",
        phase: "Released for Production",
        crewLead: "Skip Zabel",
        invoiceStatus: "Not Ready",
        communications: [
          {
            gmailId: "19dc102b21e1c14f",
            threadId: "19dc102b21e1c14f",
            subject: "SC 4702 Friendswood TX. PROJECT RELEASE",
            sender: "Skip Zabel skip@reynaldsbrothers.com",
            sentAt: "2026-04-24T19:41:00",
            storeNumber: "4702",
            city: "Friendswood",
            state: "TX",
            matchConfidence: "high",
            displayUrl: "https://mail.google.com/mail/#all/19dc102b21e1c14f",
            attachmentNames: []
          },
          {
            gmailId: "19d4034e48ab870a",
            threadId: "19d3f3645265b0be",
            subject: "Re: Sams 4702 Friendswood TX - Larger Used Cooking Oil Tank Installation",
            sender: "Shay Reynalds shay@reynaldsbrothers.com",
            sentAt: "2026-03-30T19:24:47",
            storeNumber: "4702",
            city: "Friendswood",
            state: "TX",
            matchConfidence: "high",
            displayUrl: "https://mail.google.com/mail/#all/19d4034e48ab870a",
            attachmentNames: []
          }
        ]
      }
    },
    {
      id: "rb_wi_wmtanks_5802",
      objectType: "rb.work_item",
      name: "WM 5802 — Canovanas UCO Completion",
      status: "Completed Documentation",
      health: "Healthy",
      nextAction: "Review Puerto Rico UCO completion packet against earlier tank-arrival and compliance timeline thread.",
      data: {
        serviceLine: "WalMart Tanks",
        customer: "Walmart",
        storeNumber: "5802",
        city: "Canovanas",
        state: "PR",
        sourceSystem: "gmail:wmtanks",
        workType: "UCO Work Completion",
        workOrderNumber: "GMAIL-WM-5802",
        siteName: "Walmart 5802",
        phase: "Completion Review",
        crewLead: "Jeremiah Reynalds",
        invoiceStatus: "Review",
        communications: [
          {
            gmailId: "19dc0eccb133f3b8",
            threadId: "19dc0eccb133f3b8",
            subject: "Re: store: WM 5802 04-24-2026 jeremiah@reynaldsbrothers.com UCO Walmart ACC UCO Work Completion [^]",
            sender: "Jotform via WalMart Tanks Program wmtanks@reynaldsbrothers.com",
            sentAt: "2026-04-24T19:17:12",
            storeNumber: "5802",
            city: "Canovanas",
            state: "PR",
            matchConfidence: "high",
            displayUrl: "https://mail.google.com/mail/#all/19dc0eccb133f3b8",
            attachmentNames: ["6528673824548626075_signature_55.png", "6528673824548626075_signature_12.png", "5802-Removed-old-152gal-frontline-uco-tank.pdf"]
          },
          {
            gmailId: "19d7791afc51ffd6",
            threadId: "19d201c17a78fd63",
            subject: "Re: Waste oil tank store 5802",
            sender: "Shay Reynalds shay@reynaldsbrothers.com",
            sentAt: "2026-04-27T17:40:03",
            storeNumber: "5802",
            city: "Canovanas",
            state: "PR",
            matchConfidence: "high",
            displayUrl: "https://mail.google.com/mail/#all/19d7791afc51ffd6",
            attachmentNames: []
          }
        ]
      }
    },
    {
      id: "rb_wi_wmtanks_121",
      objectType: "rb.work_item",
      name: "WM 121 — Okmulgee UCO Tank",
      status: "Oil / Temp Tank Follow-Up",
      health: "Attention",
      nextAction: "Track LES pump/removal ETA and keep the temporary tank do-not-use guidance with the card.",
      data: {
        serviceLine: "WalMart Tanks",
        customer: "Walmart",
        storeNumber: "121",
        city: "Okmulgee",
        state: "OK",
        sourceSystem: "gmail:wmtanks",
        workType: "UCO Tank Replacement",
        workOrderNumber: "GMAIL-WM-121",
        siteName: "Walmart 121",
        phase: "Oil / Temp Tank Follow-Up",
        crewLead: "Shay Reynalds",
        invoiceStatus: "Not Ready",
        communications: [
          {
            gmailId: "19dd0a1faf0c4afd",
            threadId: "19a2c88dc2ef9e9a",
            subject: "Re: 121 Okmulgee, OK - used cooking oil tank",
            sender: "Kendall McAlester via WalMart Tanks Program wmtanks@reynaldsbrothers.com",
            sentAt: "2026-04-27T20:28:47",
            storeNumber: "121",
            city: "Okmulgee",
            state: "OK",
            matchConfidence: "high",
            displayUrl: "https://mail.google.com/mail/#all/19dd0a1faf0c4afd",
            attachmentNames: []
          }
        ]
      }
    },
    {
      id: "rb_wi_wmtanks_697",
      objectType: "rb.work_item",
      name: "WM 697 — Ocala AST Inspection",
      status: "Inspection Coordination",
      health: "Attention",
      nextAction: "Confirm Alachua County inspection timing for the AST change-out.",
      data: {
        serviceLine: "WalMart Tanks",
        customer: "Walmart",
        storeNumber: "697",
        city: "Ocala",
        state: "FL",
        sourceSystem: "gmail:wmtanks",
        workType: "AST Inspection Coordination",
        workOrderNumber: "GMAIL-WM-697",
        siteName: "Walmart 697",
        phase: "Inspection Coordination",
        crewLead: "Skip Zabel",
        invoiceStatus: "Not Ready",
        communications: [
          {
            gmailId: "19dbaa25adfbe700",
            threadId: "19db670597abdcbe",
            subject: "Re: WM 697 at 2600 SW 19th Ave. Ocala FL. 34474",
            sender: "Skip Zabel skip@reynaldsbrothers.com",
            sentAt: "2026-04-23T13:58:01",
            storeNumber: "697",
            city: "Ocala",
            state: "FL",
            matchConfidence: "high",
            displayUrl: "https://mail.google.com/mail/#all/19dbaa25adfbe700",
            attachmentNames: []
          }
        ]
      }
    },
    {
      id: "rb_wi_wmtanks_1907",
      objectType: "rb.work_item",
      name: "WM 1907 — Hinsdale UCO / Morrison Gauge Photos",
      status: "Completed Documentation",
      health: "Healthy",
      nextAction: "Review photo packet confirming prior UCO removal and Morrison gauge installation.",
      data: {
        serviceLine: "WalMart Tanks",
        customer: "Walmart",
        storeNumber: "1907",
        city: "Hinsdale",
        state: "NH",
        sourceSystem: "gmail:wmtanks",
        workType: "UCO Work Completion",
        workOrderNumber: "004927",
        siteName: "Walmart 1907",
        phase: "Completion Review",
        crewLead: "Trever",
        invoiceStatus: "Review",
        communications: [
          {
            gmailId: "19d79261c0221542",
            threadId: "19d79261c0221542",
            subject: "Re: store: WM WM 1907 04-10-2026 Trever@reynaldsbrothers.com UCO Walmart ACC UCO Work Completion [^]",
            sender: "Jotform via WalMart Tanks Program wmtanks@reynaldsbrothers.com",
            sentAt: "2026-04-10T20:47:11",
            storeNumber: "1907",
            city: "Hinsdale",
            state: "NH",
            workOrderNumber: "004927",
            matchConfidence: "high",
            displayUrl: "https://mail.google.com/mail/#all/19d79261c0221542",
            attachmentNames: ["6516631761519316208_signature_55.png", "6516631761519316208_signature_12.png", "WM-1907-UCO-system-already-removed-and-Morrison-gauges-installed-2-months-prior-to-arrival.pdf"]
          }
        ]
      }
    },
    {
      id: "rb_wi_wmtanks_2331",
      objectType: "rb.work_item",
      name: "WM 2331 — Waterford ACC Morrison Gauge Completion",
      status: "Completed Documentation",
      health: "Healthy",
      nextAction: "Review Morrison gauge replacement packet and removed wiring documentation.",
      data: {
        serviceLine: "WalMart Tanks",
        customer: "Walmart",
        storeNumber: "2331",
        city: "Waterford",
        state: "CT",
        sourceSystem: "gmail:wmtanks",
        workType: "ACC Work Completion",
        workOrderNumber: "004918",
        siteName: "Walmart 2331",
        phase: "Completion Review",
        crewLead: "Trever",
        invoiceStatus: "Review",
        communications: [
          {
            gmailId: "19d784d4c28d6939",
            threadId: "19d784d4c28d6939",
            subject: "Re: store: WM WM 2331 04-10-2026 Trever@reynaldsbrothers.com ACC Walmart ACC UCO Work Completion [^]",
            sender: "Jotform via Walmart Paperwork wmpw@reynaldsbrothers.com",
            sentAt: "2026-04-10T16:50:21",
            storeNumber: "2331",
            city: "Waterford",
            state: "CT",
            workOrderNumber: "004918",
            matchConfidence: "high",
            displayUrl: "https://mail.google.com/mail/#all/19d784d4c28d6939",
            attachmentNames: ["6516489791518621125_signature_12.png", "WM-2331-Replaced-faulty-gauges-with-Morrison-Gauges-on-4-tanks.pdf"]
          }
        ]
      }
    },
    {
      id: "rb_wi_wmtanks_7676",
      objectType: "rb.work_item",
      name: "SC 7676 — Amarillo Fee Proposal",
      status: "Proposal Approved",
      health: "Healthy",
      nextAction: "Track DocuSign completion and attach the stamped plans/proposal before production release.",
      data: {
        serviceLine: "WalMart Tanks",
        customer: "Walmart",
        storeNumber: "7676",
        city: "Amarillo",
        state: "TX",
        sourceSystem: "gmail:wmtanks",
        workType: "Fee Proposal",
        workOrderNumber: "GMAIL-SC-7676",
        siteName: "Sam's Club 7676",
        phase: "Proposal Approved",
        crewLead: "Darren Fielder",
        invoiceStatus: "Not Ready",
        communications: [
          {
            gmailId: "19d782d029b819ec",
            threadId: "19d55977ccc5fd9f",
            subject: "Re: Sam's Club 7676 Amarillo TX - Fee proposal",
            sender: "Roy Payne via WalMart Tanks Program wmtanks@reynaldsbrothers.com",
            sentAt: "2026-04-10T16:15:00",
            storeNumber: "7676",
            city: "Amarillo",
            state: "TX",
            matchConfidence: "high",
            displayUrl: "https://mail.google.com/mail/#all/19d782d029b819ec",
            attachmentNames: ["2026-03-26 Sams Club 7676 Amarillo TX Grease Interceptor Replacement Proposal.pdf"]
          }
        ]
      }
    },
    {
      id: "rb_wi_wmtanks_4801",
      objectType: "rb.work_item",
      name: "SC 4801 — Riverview UCO Project Release",
      status: "Released for Production",
      health: "Healthy",
      nextAction: "Proceed with production and keep uploaded LxRetail permit documents with the project card.",
      data: {
        serviceLine: "WalMart Tanks",
        customer: "Walmart",
        storeNumber: "4801",
        city: "Riverview",
        state: "FL",
        sourceSystem: "gmail:wmtanks",
        workType: "UCO Tank Replacement",
        workOrderNumber: "4801.1015",
        siteName: "Sam's Club 4801",
        phase: "Released for Production",
        crewLead: "John Nester",
        invoiceStatus: "Not Ready",
        communications: [
          {
            gmailId: "19d49f3999e8adc0",
            threadId: "19d49f3999e8adc0",
            subject: "SC 4801 Riverview, FL -PROJECT RELEASE",
            sender: "John Nester john.nester@reynaldsbrothers.com",
            sentAt: "2026-04-01T16:49:41",
            storeNumber: "4801",
            city: "Riverview",
            state: "FL",
            matchConfidence: "high",
            displayUrl: "https://mail.google.com/mail/#all/19d49f3999e8adc0",
            attachmentNames: []
          },
          {
            gmailId: "19d49e2df0a1ab3e",
            threadId: "19d49e2df0a1ab3e",
            subject: "[LxRetail] 4801.1015 Riverview FL UCO Tank Replacement Workflow Updated",
            sender: "Walmart via WalMart Tanks Program wmtanks@reynaldsbrothers.com",
            sentAt: "2026-04-01T16:31:34",
            storeNumber: "4801",
            city: "Riverview",
            state: "FL",
            workOrderNumber: "4801.1015",
            matchConfidence: "high",
            displayUrl: "https://mail.google.com/mail/#all/19d49e2df0a1ab3e",
            attachmentNames: ["04801.1015.2026.04.01.FL.UCO.DPR.pdf", "04801.1015.2026.04.01.FL.UCO.DwgPkg.pdf", "04801.1015.2026.04.01.FL.UCO.PAP.pdf"]
          }
        ]
      }
    },
    {
      id: "rb_wi_wmtanks_4201",
      objectType: "rb.work_item",
      name: "WM 4201 — Edgewood ACC Analog Gauge",
      status: "Scheduled",
      health: "Attention",
      nextAction: "Track APG removal and new gauge installation by the promised end-of-week window.",
      data: {
        serviceLine: "WalMart Tanks",
        customer: "Walmart",
        storeNumber: "4201",
        city: "Edgewood",
        state: "NM",
        sourceSystem: "gmail:wmtanks",
        workType: "ACC Analog Gauge",
        workOrderNumber: "GMAIL-WM-4201",
        siteName: "Walmart 4201",
        phase: "Scheduled",
        crewLead: "Darren Fielder",
        invoiceStatus: "Not Ready",
        communications: [
          {
            gmailId: "19d49e5fa05c1439",
            threadId: "19d49e5fa05c1439",
            subject: "RE: Waste water tank ACC analog gauge store 4201 Edgewood, NM",
            sender: "Rachel Marie Barton via WalMart Tanks Program wmtanks@reynaldsbrothers.com",
            sentAt: "2026-04-01T16:34:47",
            storeNumber: "4201",
            city: "Edgewood",
            state: "NM",
            matchConfidence: "high",
            displayUrl: "https://mail.google.com/mail/#all/19d49e5fa05c1439",
            attachmentNames: []
          }
        ]
      }
    },
    {
      id: "rb_wi_wmtanks_3826",
      objectType: "rb.work_item",
      name: "WM 3826 — Lubbock UCO Completion",
      status: "Completed Documentation",
      health: "Healthy",
      nextAction: "Review UCO removal/install packet and serial numbers.",
      data: {
        serviceLine: "WalMart Tanks",
        customer: "Walmart",
        storeNumber: "3826",
        city: "Lubbock",
        state: "TX",
        sourceSystem: "gmail:wmtanks",
        workType: "UCO Work Completion",
        workOrderNumber: "GMAIL-WM-3826",
        siteName: "Walmart 3826",
        phase: "Completion Review",
        crewLead: "Austin Wright",
        invoiceStatus: "Review",
        communications: [
          {
            gmailId: "19d4543cf5a258b3",
            threadId: "19d4543cf5a258b3",
            subject: "Re: store: WM WM 3826 03-31-2026 austin.wright@reynaldsbrothers.com UCO Walmart ACC UCO Work Completion [^]",
            sender: "Jotform via WalMart Tanks Program wmtanks@reynaldsbrothers.com",
            sentAt: "2026-03-31T18:59:21",
            storeNumber: "3826",
            city: "Lubbock",
            state: "TX",
            matchConfidence: "high",
            displayUrl: "https://mail.google.com/mail/#all/19d4543cf5a258b3",
            attachmentNames: ["6507927071391602391_signature_12.png", "WM-3826-Removed-old-UCO-unit.pdf"]
          },
          {
            gmailId: "19d3f574290ebe94",
            threadId: "19c71b6cb551ce9c",
            subject: "Re: WM Supercenter #3826 - Lubbock, TX - Used Cooking Oil Tank Replacement",
            sender: "Jasmin Garcia via WalMart Tanks Program wmtanks@reynaldsbrothers.com",
            sentAt: "2026-03-30T15:22:33",
            storeNumber: "3826",
            city: "Lubbock",
            state: "TX",
            matchConfidence: "high",
            displayUrl: "https://mail.google.com/mail/#all/19d3f574290ebe94",
            attachmentNames: []
          }
        ]
      }
    },
    {
      id: "rb_wi_wmtanks_4843",
      objectType: "rb.work_item",
      name: "WM 4843 — Pearland Fire Final Inspection",
      status: "Inspection Approved",
      health: "Healthy",
      nextAction: "Attach approved Pearland fire final inspection to close permit evidence.",
      data: {
        serviceLine: "WalMart Tanks",
        customer: "Walmart",
        storeNumber: "4843",
        city: "Pearland",
        state: "TX",
        sourceSystem: "gmail:wmtanks",
        workType: "Fire Final Inspection",
        workOrderNumber: "COM2025-10030",
        siteName: "Walmart 4843",
        phase: "Inspection Approved",
        crewLead: "Skip Zabel",
        invoiceStatus: "Not Ready",
        communications: [
          {
            gmailId: "19d448a3b1859d6f",
            threadId: "19d448a3b1859d6f",
            subject: "FW: Inspection has been Completed (4843 Pearland TX)",
            sender: "Krista Krenz krista.krenz@aptim.com",
            sentAt: "2026-03-31T15:36:36",
            storeNumber: "4843",
            city: "Pearland",
            state: "TX",
            workOrderNumber: "COM2025-10030",
            matchConfidence: "high",
            displayUrl: "https://mail.google.com/mail/#all/19d448a3b1859d6f",
            attachmentNames: []
          }
        ]
      }
    },
    {
      id: "rb_wi_wmtanks_175",
      objectType: "rb.work_item",
      name: "WM 175 — Collierville UCO Workflow",
      status: "Workflow Updated",
      health: "Attention",
      nextAction: "Review uploaded DPR, drawing package, PAP, and permit application documents.",
      data: {
        serviceLine: "WalMart Tanks",
        customer: "Walmart",
        storeNumber: "175",
        city: "Collierville",
        state: "TN",
        sourceSystem: "gmail:wmtanks",
        workType: "UCO Tank Replacement",
        workOrderNumber: "175.1016",
        siteName: "Walmart 175",
        phase: "Workflow Updated",
        crewLead: null,
        invoiceStatus: "Not Ready",
        communications: [
          {
            gmailId: "19d45c10b9a34d2a",
            threadId: "19d45c10b9a34d2a",
            subject: "[LxRetail] 175.1016 Collierville TN UCO Tank Replacement Workflow Updated",
            sender: "Walmart via WalMart Tanks Program wmtanks@reynaldsbrothers.com",
            sentAt: "2026-03-31T21:16:09",
            storeNumber: "175",
            city: "Collierville",
            state: "TN",
            workOrderNumber: "175.1016",
            matchConfidence: "high",
            displayUrl: "https://mail.google.com/mail/#all/19d45c10b9a34d2a",
            attachmentNames: ["00175.1016.2026.03.31.TN.UCO.DPR.pdf", "00175.1016.2026.03.31.TN.UCO.DwgPkg.pdf", "00175.1016.2026.03.31.TN.UCO.PAP.pdf", "00175.1016.2026.03.31.TN.UCO.PermitApp.pdf"]
          }
        ]
      }
    },
    {
      id: "rb_wi_wmtanks_2928",
      objectType: "rb.work_item",
      name: "WM 2928 — Goose Creek Project Release",
      status: "Released for Production",
      health: "Healthy",
      nextAction: "Move to production with no permit or inspection requirement.",
      data: {
        serviceLine: "WalMart Tanks",
        customer: "Walmart",
        storeNumber: "2928",
        city: "Goose Creek",
        state: "SC",
        sourceSystem: "gmail:wmtanks",
        workType: "Project Release",
        workOrderNumber: "GMAIL-WM-2928",
        siteName: "Walmart 2928",
        phase: "Released for Production",
        crewLead: "John Nester",
        invoiceStatus: "Not Ready",
        communications: [
          {
            gmailId: "19d4054e05d99c6d",
            threadId: "19d4054e05d99c6d",
            subject: "WM 2928 Goose Creek, SC -PROJECT RELEASE",
            sender: "John Nester john.nester@reynaldsbrothers.com",
            sentAt: "2026-03-30T19:59:45",
            storeNumber: "2928",
            city: "Goose Creek",
            state: "SC",
            matchConfidence: "high",
            displayUrl: "https://mail.google.com/mail/#all/19d4054e05d99c6d",
            attachmentNames: []
          }
        ]
      }
    },
    {
      id: "rb_wi_wmtanks_4794",
      objectType: "rb.work_item",
      name: "SC 4794 — Lakeland Grease Tank",
      status: "Tank Removal Follow-Up",
      health: "Attention",
      nextAction: "Track extra grease tank pickup/removal after install and keep service photos with the card.",
      data: {
        serviceLine: "WalMart Tanks",
        customer: "Walmart",
        storeNumber: "4794",
        city: "Lakeland",
        state: "FL",
        sourceSystem: "gmail:wmtanks",
        workType: "Grease Tank Removal",
        workOrderNumber: "344185400",
        siteName: "Sam's Club 4794",
        phase: "Tank Removal Follow-Up",
        crewLead: "James Sbanotto",
        invoiceStatus: "Not Ready",
        communications: [
          {
            gmailId: "19d3fa461367e0cb",
            threadId: "19cdd214f65152a2",
            subject: "Re: Sam’s Club 4794 - Lakeland, FL - Grease Tank",
            sender: "James Sbanotto via WalMart Tanks Program wmtanks@reynaldsbrothers.com",
            sentAt: "2026-03-30T16:46:23",
            storeNumber: "4794",
            city: "Lakeland",
            state: "FL",
            workOrderNumber: "344185400",
            matchConfidence: "high",
            displayUrl: "https://mail.google.com/mail/#all/19d3fa461367e0cb",
            attachmentNames: []
          }
        ]
      }
    },
    {
      id: "rb_wi_wmtanks_8156",
      objectType: "rb.work_item",
      name: "SC 8156 - Laredo UCO Tank Replacement",
      status: "Scheduled",
      health: "Attention",
      nextAction: "Track Reynalds scheduled replacement after the 03/24 tank pump-out window.",
      data: {
        serviceLine: "WalMart Tanks",
        customer: "Walmart",
        storeNumber: "8156",
        city: "Laredo",
        state: "TX",
        sourceSystem: "gmail:wmtanks",
        workType: "Used Cooking Oil Tank Replacement",
        workOrderNumber: "GMAIL-SC-8156",
        siteName: "Sam's Club 8156",
        phase: "Scheduled",
        crewLead: "Ryan Sherman",
        invoiceStatus: "Not Ready",
        communications: [
          {
            gmailId: "19d1c5aa9b4771de",
            threadId: "1991653002d317bd",
            subject: "RE: Sam's Club 8156 - Laredo, TX - Used Cooking Oil Tank Replacement",
            sender: "Vincent Aguirre via WalMart Tanks Program wmtanks@reynaldsbrothers.com",
            sentAt: "2026-03-23T20:19:34",
            storeNumber: "8156",
            city: "Laredo",
            state: "TX",
            matchConfidence: "high",
            displayUrl: "https://mail.google.com/mail/#all/19d1c5aa9b4771de",
            attachmentNames: []
          }
        ]
      }
    },
    {
      id: "rb_wi_wmtanks_8224",
      objectType: "rb.work_item",
      name: "SC 8224 - Wichita Falls UCO Tank Replacement",
      status: "Scheduled",
      health: "Attention",
      nextAction: "Confirm replacement schedule and keep vendor coordination with the job card.",
      data: {
        serviceLine: "WalMart Tanks",
        customer: "Walmart",
        storeNumber: "8224",
        city: "Wichita Falls",
        state: "TX",
        sourceSystem: "gmail:wmtanks",
        workType: "Used Cooking Oil Tank Replacement",
        workOrderNumber: "GMAIL-SC-8224",
        siteName: "Sam's Club 8224",
        phase: "Scheduled",
        crewLead: "Shay Reynalds",
        invoiceStatus: "Not Ready",
        communications: [
          {
            gmailId: "19d1c46e3fc77858",
            threadId: "1999c5651245493b",
            subject: "Re: Sam's Club 8224 - Wichita Falls, TX - Used Cooking Oil Tank Replacement",
            sender: "Shay Reynalds shay@reynaldsbrothers.com",
            sentAt: "2026-03-23T23:09:59",
            storeNumber: "8224",
            city: "Wichita Falls",
            state: "TX",
            matchConfidence: "high",
            displayUrl: "https://mail.google.com/mail/#all/19d1c46e3fc77858",
            attachmentNames: []
          }
        ]
      }
    },
    {
      id: "rb_wi_wmtanks_970",
      objectType: "rb.work_item",
      name: "WM 970 - Picayune UCO Tank Replacement",
      status: "Replacement Requested",
      health: "Attention",
      nextAction: "Track damaged UCO tank replacement, temporary smell mitigation, and May install timing.",
      data: {
        serviceLine: "WalMart Tanks",
        customer: "Walmart",
        storeNumber: "970",
        city: "Picayune",
        state: "MS",
        sourceSystem: "gmail:wmtanks",
        workType: "Used Cooking Oil Tank Replacement",
        workOrderNumber: "GMAIL-WM-970",
        siteName: "Walmart 970",
        phase: "Replacement Requested",
        crewLead: "Kleenco / install team",
        invoiceStatus: "Not Ready",
        communications: [
          {
            gmailId: "19cfbd0861581739",
            threadId: "19cf9400daafdf48",
            subject: "Re: 970 Picayune MS - Used Cooking Oil Tank replacement",
            sender: "Justin Matthews via WalMart Tanks Program wmtanks@reynaldsbrothers.com",
            sentAt: "2026-03-17T12:40:42",
            storeNumber: "970",
            city: "Picayune",
            state: "MS",
            matchConfidence: "high",
            displayUrl: "https://mail.google.com/mail/#all/19cfbd0861581739",
            attachmentNames: []
          }
        ]
      }
    },
    {
      id: "rb_wi_wmtanks_6521",
      objectType: "rb.work_item",
      name: "SC 6521 - Houma UCO Tank Replacement",
      status: "Scheduled",
      health: "Attention",
      nextAction: "Track 03/19 install, pump-out, and temporary bin replacement details.",
      data: {
        serviceLine: "WalMart Tanks",
        customer: "Walmart",
        storeNumber: "6521",
        city: "Houma",
        state: "LA",
        sourceSystem: "gmail:wmtanks",
        workType: "Used Cooking Oil Tank Replacement",
        workOrderNumber: "GMAIL-SC-6521",
        siteName: "Sam's Club 6521",
        phase: "Scheduled",
        crewLead: "Shay Reynalds",
        invoiceStatus: "Not Ready",
        communications: [
          {
            gmailId: "19cf88622fcf0e9c",
            threadId: "19ab7572055eb70b",
            subject: "Re: EXT: Re: SC 6521 - Houma, LA - Used Cooking Oil Tank Replacement",
            sender: "Shay Reynalds shay@reynaldsbrothers.com",
            sentAt: "2026-03-16T21:20:28",
            storeNumber: "6521",
            city: "Houma",
            state: "LA",
            matchConfidence: "high",
            displayUrl: "https://mail.google.com/mail/#all/19cf88622fcf0e9c",
            attachmentNames: []
          }
        ]
      }
    },
    {
      id: "rb_wi_wmtanks_8263",
      objectType: "rb.work_item",
      name: "SC 8263 - Tulsa UCO Tank Replacement",
      status: "Tank Ordered",
      health: "Attention",
      nextAction: "Track tank order, temporary FOG bin, pump-out, and late-April install window.",
      data: {
        serviceLine: "WalMart Tanks",
        customer: "Walmart",
        storeNumber: "8263",
        city: "Tulsa",
        state: "OK",
        sourceSystem: "gmail:wmtanks",
        workType: "Used Cooking Oil Tank Replacement",
        workOrderNumber: "GMAIL-SC-8263",
        siteName: "Sam's Club 8263",
        phase: "Tank Ordered",
        crewLead: "Shay Reynalds",
        invoiceStatus: "Not Ready",
        communications: [
          {
            gmailId: "19cbf9df3c935c23",
            threadId: "19cbf783c3342f1d",
            subject: "Re: store 8263 Tulsa, OK - Used Cooking Oil Tank Replacement",
            sender: "Shay Reynalds shay@reynaldsbrothers.com",
            sentAt: "2026-03-05T20:08:05",
            storeNumber: "8263",
            city: "Tulsa",
            state: "OK",
            matchConfidence: "high",
            displayUrl: "https://mail.google.com/mail/#all/19cbf9df3c935c23",
            attachmentNames: []
          }
        ]
      }
    },
    {
      id: "rb_wi_wmtanks_5172",
      objectType: "rb.work_item",
      name: "WM 5172 - Perry Lucernex Workflow",
      status: "Lucernex Created",
      health: "Healthy",
      nextAction: "Keep Lucernex workflow confirmation and APTIM upload note with the project card.",
      data: {
        serviceLine: "WalMart Tanks",
        customer: "Walmart",
        storeNumber: "5172",
        city: "Perry",
        state: "FL",
        sourceSystem: "gmail:wmtanks",
        workType: "Lucernex Workflow",
        workOrderNumber: "GMAIL-WM-5172",
        siteName: "Walmart 5172",
        phase: "Lucernex Created",
        crewLead: "Shay Reynalds",
        invoiceStatus: "Not Ready",
        communications: [
          {
            gmailId: "19cbf8f26394ef67",
            threadId: "19c492ae6c4481fb",
            subject: "RE: 5172 Perry FL - no workflow?",
            sender: "Krista Krenz krista.krenz@aptim.com",
            sentAt: "2026-03-05T19:52:28",
            storeNumber: "5172",
            city: "Perry",
            state: "FL",
            matchConfidence: "high",
            displayUrl: "https://mail.google.com/mail/#all/19cbf8f26394ef67",
            attachmentNames: []
          },
          {
            gmailId: "19c62f8c2be095ce",
            threadId: "19c62f8c2be095ce",
            subject: "Re: store: WM WM- 5172 02-15-2026 Joseph.gossage@reynaldsbrothers.com ACC Walmart ACC UCO Work Completion [^]",
            sender: "Jotform via Walmart Paperwork wmpw@reynaldsbrothers.com",
            sentAt: "2026-02-15T20:23:13",
            storeNumber: "5172",
            city: "Perry",
            state: "FL",
            matchConfidence: "high",
            displayUrl: "https://mail.google.com/mail/#all/19c62f8c2be095ce",
            attachmentNames: ["6469961384329761911_signature_55.png", "6469961384329761911_signature_12.png", "WM-5172-Removed-old-new-and-used-oil-tanks.pdf"]
          }
        ]
      }
    },
    {
      id: "rb_wi_wmtanks_690",
      objectType: "rb.work_item",
      name: "WM 690 - Elizabethton UCO Tank Replacement",
      status: "Install Scheduled",
      health: "Attention",
      nextAction: "Track 03/08 install, final pump-out, and Lucernex/PO upload follow-up.",
      data: {
        serviceLine: "WalMart Tanks",
        customer: "Walmart",
        storeNumber: "690",
        city: "Elizabethton",
        state: "TN",
        sourceSystem: "gmail:wmtanks",
        workType: "Used Cooking Oil Tank Replacement",
        workOrderNumber: "GMAIL-WM-690",
        siteName: "Walmart 690",
        phase: "Install Scheduled",
        crewLead: "Jeremiah Reynalds",
        invoiceStatus: "Not Ready",
        communications: [
          {
            gmailId: "19cbf4f073dc1822",
            threadId: "19cb434d834b41e0",
            subject: "RE: Walmart 690 - Elizabethton, TN - Used Cooking Oil Tank Replacement",
            sender: "Vincent Aguirre Vincent.Aguirre@liquidenviro.com",
            sentAt: "2026-03-05T19:02:59",
            storeNumber: "690",
            city: "Elizabethton",
            state: "TN",
            matchConfidence: "high",
            displayUrl: "https://mail.google.com/mail/#all/19cbf4f073dc1822",
            attachmentNames: []
          }
        ]
      }
    },
    {
      id: "rb_wi_wmtanks_5780",
      objectType: "rb.work_item",
      name: "WM 5780 - Paragould UCO Completion",
      status: "Completed Documentation",
      health: "Healthy",
      nextAction: "Review UCO completion packet and removed-tank documentation.",
      data: {
        serviceLine: "WalMart Tanks",
        customer: "Walmart",
        storeNumber: "5780",
        city: "Paragould",
        state: "AR",
        sourceSystem: "gmail:wmtanks",
        workType: "UCO Work Completion",
        workOrderNumber: "GMAIL-WM-5780",
        siteName: "Walmart 5780",
        phase: "Completion Review",
        crewLead: "Jeremiah Reynalds",
        invoiceStatus: "Review",
        communications: [
          {
            gmailId: "19c91c1c290785e0",
            threadId: "19c91c1c290785e0",
            subject: "Re: store: WM 5780 02-24-2026 jeremiah@reynaldsbrothers.com UCO Walmart ACC UCO Work Completion [^]",
            sender: "Jotform via WalMart Tanks Program wmtanks@reynaldsbrothers.com",
            sentAt: "2026-02-24T22:25:17",
            storeNumber: "5780",
            city: "Paragould",
            state: "AR",
            matchConfidence: "high",
            displayUrl: "https://mail.google.com/mail/#all/19c91c1c290785e0",
            attachmentNames: ["6477810598741523799_signature_55.png", "6477810598741523799_signature_12.png", "5780-Removed-old-75-gal-uco-tank.pdf"]
          }
        ]
      }
    },
    {
      id: "rb_wi_wmtanks_1185",
      objectType: "rb.work_item",
      name: "WM 1185 - Austin ACC Tank Workflow",
      status: "Workflow Updated",
      health: "Healthy",
      nextAction: "Keep uploaded SPCC document with the ACC tank replacement project.",
      data: {
        serviceLine: "WalMart Tanks",
        customer: "Walmart",
        storeNumber: "1185",
        city: "Austin",
        state: "TX",
        sourceSystem: "gmail:wmtanks",
        workType: "ACC Tank Replacement",
        workOrderNumber: "1185.1013",
        siteName: "Walmart 1185",
        phase: "Workflow Updated",
        crewLead: "Krista Krenz",
        invoiceStatus: "Not Ready",
        communications: [
          {
            gmailId: "19c91899e0447d8d",
            threadId: "19c91899e0447d8d",
            subject: "[LxRetail] 1185.1013 Austin TX ACC Tank Replacement Workflow Updated",
            sender: "Walmart via WalMart Tanks Program wmtanks@reynaldsbrothers.com",
            sentAt: "2026-02-24T21:23:58",
            storeNumber: "1185",
            city: "Austin",
            state: "TX",
            workOrderNumber: "1185.1013",
            matchConfidence: "high",
            displayUrl: "https://mail.google.com/mail/#all/19c91899e0447d8d",
            attachmentNames: []
          }
        ]
      }
    },
    {
      id: "rb_wi_wmtanks_5960",
      objectType: "rb.work_item",
      name: "WM 5960 - Socorro Caddy Motor Warranty",
      status: "Parts Tracking",
      health: "Attention",
      nextAction: "Confirm UPS movement and replacement motor delivery for the caddy repair.",
      data: {
        serviceLine: "WalMart Tanks",
        customer: "Walmart",
        storeNumber: "5960",
        city: "Socorro",
        state: "TX",
        sourceSystem: "gmail:wmtanks",
        workType: "Caddy Motor Warranty",
        workOrderNumber: "GMAIL-WM-5960",
        siteName: "Walmart 5960",
        phase: "Parts Tracking",
        crewLead: "Darren Fielder",
        invoiceStatus: "Not Ready",
        communications: [
          {
            gmailId: "19c913d687e6e786",
            threadId: "19c6c75e60acbdc0",
            subject: "Re: WM 5960 Socorro TX - 47gal Caddy",
            sender: "Darren Fielder darren@reynaldsbrothers.com",
            sentAt: "2026-02-24T20:00:06",
            storeNumber: "5960",
            city: "Socorro",
            state: "TX",
            matchConfidence: "high",
            displayUrl: "https://mail.google.com/mail/#all/19c913d687e6e786",
            attachmentNames: ["Screenshot 2026-02-24 at 13-59-04 Tracking UPS - United States.png"]
          }
        ]
      }
    },
    {
      id: "rb_wi_wmtanks_3535",
      objectType: "rb.work_item",
      name: "WM 3535 - Epping ACC Gauge",
      status: "Awarded",
      health: "Attention",
      nextAction: "Expedite APG removal and physical gauge placement for ACC wastewater tank.",
      data: {
        serviceLine: "WalMart Tanks",
        customer: "Walmart",
        storeNumber: "3535",
        city: "Epping",
        state: "NH",
        sourceSystem: "gmail:wmtanks",
        workType: "ACC Gauge Replacement",
        workOrderNumber: "USEV-004928",
        siteName: "Walmart 3535",
        phase: "Awarded",
        crewLead: "Rachel Barton",
        invoiceStatus: "Not Ready",
        communications: [
          {
            gmailId: "19c8cd417a7183bd",
            threadId: "19c8cd417a7183bd",
            subject: "RE: Wastewater tank gauge issue 3535 Epping NH - Reynalds",
            sender: "Rachel Marie Barton via WalMart Tanks Program wmtanks@reynaldsbrothers.com",
            sentAt: "2026-02-23T23:27:00",
            storeNumber: "3535",
            city: "Epping",
            state: "NH",
            workOrderNumber: "USEV-004928",
            matchConfidence: "high",
            displayUrl: "https://mail.google.com/mail/#all/19c8cd417a7183bd",
            attachmentNames: []
          }
        ]
      }
    },
    {
      id: "rb_wi_wmtanks_4445",
      objectType: "rb.work_item",
      name: "WM 4445 - Clemson UCO Completion",
      status: "Completed Documentation",
      health: "Healthy",
      nextAction: "Review UCO completion packet and removed-tank documentation.",
      data: {
        serviceLine: "WalMart Tanks",
        customer: "Walmart",
        storeNumber: "4445",
        city: "Clemson",
        state: "SC",
        sourceSystem: "gmail:wmtanks",
        workType: "UCO Work Completion",
        workOrderNumber: "GMAIL-WM-4445",
        siteName: "Walmart 4445",
        phase: "Completion Review",
        crewLead: "Jeremiah Reynalds",
        invoiceStatus: "Review",
        communications: [
          {
            gmailId: "19c7d3d579b28194",
            threadId: "19c7d3d579b28194",
            subject: "Re: store: WM 4445 02-20-2026 jeremiah@reynaldsbrothers.com UCO Walmart ACC UCO Work Completion [^]",
            sender: "Jotform via WalMart Tanks Program wmtanks@reynaldsbrothers.com",
            sentAt: "2026-02-20T22:48:15",
            storeNumber: "4445",
            city: "Clemson",
            state: "SC",
            matchConfidence: "high",
            displayUrl: "https://mail.google.com/mail/#all/19c7d3d579b28194",
            attachmentNames: ["6474368415126715348_signature_12.png", "4445-Removed-old-75-gal-uco-tank.pdf"]
          }
        ]
      }
    },
    {
      id: "rb_wi_wmtanks_1090",
      objectType: "rb.work_item",
      name: "WM 1090 - Jacksonville ACC Completion",
      status: "Completed Documentation",
      health: "Healthy",
      nextAction: "Review ACC completion packet and tank serial numbers.",
      data: {
        serviceLine: "WalMart Tanks",
        customer: "Walmart",
        storeNumber: "1090",
        city: "Jacksonville",
        state: "FL",
        sourceSystem: "gmail:wmtanks",
        workType: "ACC Work Completion",
        workOrderNumber: "GMAIL-WM-1090",
        siteName: "Walmart 1090",
        phase: "Completion Review",
        crewLead: "Joseph Gossage",
        invoiceStatus: "Review",
        communications: [
          {
            gmailId: "19c6dd8fc00c13b8",
            threadId: "19c6dd8fc00c13b8",
            subject: "Re: store: WM WM 1090 02-17-2026 Joseph.gossage@reynaldsbrothers.com ACC Walmart ACC UCO Work Completion [^]",
            sender: "Jotform via WalMart Tanks Program wmtanks@reynaldsbrothers.com",
            sentAt: "2026-02-17T23:04:20",
            storeNumber: "1090",
            city: "Jacksonville",
            state: "FL",
            matchConfidence: "high",
            displayUrl: "https://mail.google.com/mail/#all/19c6dd8fc00c13b8",
            attachmentNames: ["6471786074016921479_signature_55.png", "6471786074016921479_signature_12.png", "WM-1090-Removed-old-used-and-new-oil-tanks.pdf"]
          }
        ]
      }
    },
    {
      id: "rb_wi_wmtanks_501",
      objectType: "rb.work_item",
      name: "WM 501 - Laurel ACC Tank Workflow",
      status: "Workflow Updated",
      health: "Healthy",
      nextAction: "Keep uploaded DPR, drawing package, and PAP documents with the ACC tank replacement card.",
      data: {
        serviceLine: "WalMart Tanks",
        customer: "Walmart",
        storeNumber: "501",
        city: "Laurel",
        state: "MS",
        sourceSystem: "gmail:wmtanks",
        workType: "ACC Tank Replacement",
        workOrderNumber: "501.1011",
        siteName: "Walmart 501",
        phase: "Workflow Updated",
        crewLead: "Krista Krenz",
        invoiceStatus: "Not Ready",
        communications: [
          {
            gmailId: "19c698a96621f1ad",
            threadId: "19c698a96621f1ad",
            subject: "[LxRetail] 501.1011 Laurel MS ACC Tank Replacement Workflow Updated",
            sender: "Walmart via WalMart Tanks Program wmtanks@reynaldsbrothers.com",
            sentAt: "2026-02-17T03:00:09",
            storeNumber: "501",
            city: "Laurel",
            state: "MS",
            workOrderNumber: "501.1011",
            matchConfidence: "high",
            displayUrl: "https://mail.google.com/mail/#all/19c698a96621f1ad",
            attachmentNames: []
          }
        ]
      }
    },
    {
      id: "rb_wi_wmtanks_4421",
      objectType: "rb.work_item",
      name: "WM 4421 - Columbus UCO Workflow",
      status: "Workflow Updated",
      health: "Healthy",
      nextAction: "Keep uploaded DPR, drawing package, fire safety worksheet, and PAP documents with the UCO card.",
      data: {
        serviceLine: "WalMart Tanks",
        customer: "Walmart",
        storeNumber: "4421",
        city: "Columbus",
        state: "GA",
        sourceSystem: "gmail:wmtanks",
        workType: "UCO Tank Replacement",
        workOrderNumber: "4421.1010",
        siteName: "Walmart 4421",
        phase: "Workflow Updated",
        crewLead: "Krista Krenz",
        invoiceStatus: "Not Ready",
        communications: [
          {
            gmailId: "19c68d5e5b3047d8",
            threadId: "19c68d5e5b3047d8",
            subject: "[LxRetail] 4421.1010 Columbus GA UCO Tank Replacement Workflow Updated",
            sender: "Walmart via WalMart Tanks Program wmtanks@reynaldsbrothers.com",
            sentAt: "2026-02-16T23:42:52",
            storeNumber: "4421",
            city: "Columbus",
            state: "GA",
            workOrderNumber: "4421.1010",
            matchConfidence: "high",
            displayUrl: "https://mail.google.com/mail/#all/19c68d5e5b3047d8",
            attachmentNames: []
          }
        ]
      }
    },
    {
      id: "rb_wi_wmtanks_7251",
      objectType: "rb.work_item",
      name: "NHM 7251 - Fort Worth UCO Tank Replacement",
      status: "Service Dispatched",
      health: "Attention",
      nextAction: "Track oil pickup ETA, temporary bin dispatch, and replacement tank ship date.",
      data: {
        serviceLine: "WalMart Tanks",
        customer: "Walmart",
        storeNumber: "7251",
        city: "Fort Worth",
        state: "TX",
        sourceSystem: "gmail:wmtanks",
        workType: "Used Cooking Oil Tank Replacement",
        workOrderNumber: "GMAIL-NHM-7251",
        siteName: "Neighborhood Market 7251",
        phase: "Service Dispatched",
        crewLead: "Shay Reynalds",
        invoiceStatus: "Not Ready",
        communications: [
          {
            gmailId: "19c67a722840f1f9",
            threadId: "19bc3edf20617130",
            subject: "RE: EXT: Re: NHM 7251 - Fort Worth, TX - Used Cooking Oil Tank Replacement",
            sender: "Kearra Swift via WalMart Tanks Program wmtanks@reynaldsbrothers.com",
            sentAt: "2026-02-16T18:12:28",
            storeNumber: "7251",
            city: "Fort Worth",
            state: "TX",
            matchConfidence: "high",
            displayUrl: "https://mail.google.com/mail/#all/19c67a722840f1f9",
            attachmentNames: []
          }
        ]
      }
    },
    {
      id: "rb_wi_wmtanks_email_review",
      objectType: "rb.work_item",
      name: "WalMart Tanks Email Review Queue",
      status: "Review",
      health: "Attention",
      nextAction: "Assign unmatched Gmail messages to the correct store, WO, PO, or project card.",
      data: {
        serviceLine: "WalMart Tanks",
        customer: "Walmart",
        sourceSystem: "gmail:wmtanks",
        workType: "Email Review Queue",
        workOrderNumber: "REVIEW-WMTANKS",
        siteName: "WalMart Tanks / wmtanks Gmail Label",
        phase: "Needs Filing",
        crewLead: null,
        invoiceStatus: "Not Ready",
        reviewQueue: [
          {
            gmailId: "19fade741dff1b32",
            subject: "Frontline International Invoice(s) - 71768",
            sender: "Orders clerk@frontlineii.com",
            sentAt: "2026-07-29T08:43:50-04:00",
            matchConfidence: "review",
            reviewReason: "Invoice email did not expose a store number, WO, or PO in the Gmail search result.",
            displayUrl: "https://mail.google.com/mail/#all/19fade741dff1b32",
            attachmentNames: ["AR Invoices_71768.pdf"]
          },
          {
            gmailId: "19fade6e9dd63e80",
            subject: "Tracking Information For PO# WM-0157",
            sender: "Orders clerk@frontlineii.com",
            sentAt: "2026-07-29T08:43:30-04:00",
            purchaseOrderNumber: "WM-0157",
            matchConfidence: "review",
            reviewReason: "PO was detected but no existing store/job card was identified from the Gmail search result.",
            displayUrl: "https://mail.google.com/mail/#all/19fade6e9dd63e80",
            attachmentNames: []
          },
          {
            gmailId: "19fa9cb5675b4ac4",
            subject: "Re: Walmart - Request for Anti-Siphon Exemption",
            sender: "Shay Reynalds shay@reynaldsbrothers.com",
            sentAt: "2026-07-28T12:34:24-05:00",
            matchConfidence: "review",
            reviewReason: "Subject and snippet describe a program request without a store, WO, or PO.",
            displayUrl: "https://mail.google.com/mail/#all/19fa9cb5675b4ac4",
            attachmentNames: []
          },
          {
            gmailId: "19e88de31ef4e548",
            threadId: "19e02e1a825f7880",
            subject: "RE: Next set of 6 stores (Sales Orders #7296 - #7301), adding Sales Order #7348",
            sender: "Dave Dooley via WalMart Tanks Program wmtanks@reynaldsbrothers.com",
            sentAt: "2026-06-02T15:05:06",
            matchConfidence: "review",
            reviewReason: "Supplier sales-order thread references multiple stores and sales orders; attachment review is required before filing.",
            displayUrl: "https://mail.google.com/mail/#all/19e88de31ef4e548",
            attachmentNames: []
          },
          {
            gmailId: "19dfe4c611a63fea",
            threadId: "19dfe4a1d8633d86",
            subject: "Re: Newberry Tank Billing",
            sender: "Shay Reynalds shay@reynaldsbrothers.com",
            sentAt: "2026-05-06T17:17:53",
            matchConfidence: "review",
            reviewReason: "Billing thread maps multiple invoices to stores 814, 551, 563, 942, and 943; split by invoice before filing.",
            displayUrl: "https://mail.google.com/mail/#all/19dfe4c611a63fea",
            attachmentNames: []
          },
          {
            gmailId: "19e0830705a1d31d",
            threadId: "19de47955513ac59",
            subject: "Re: Pump out Request",
            sender: "Vincent Aguirre / Liquid Environmental Solutions",
            sentAt: "2026-05-08T15:23:59",
            matchConfidence: "review",
            reviewReason: "Coordination thread references multiple Sam's Club locations and service windows; split by store before filing.",
            displayUrl: "https://mail.google.com/mail/#all/19e0830705a1d31d",
            attachmentNames: []
          },
          {
            gmailId: "19df38e814da5eee",
            threadId: "19dba8ced2020a2b",
            subject: "Re: Home Office and Transportation Grease Tank Removal",
            sender: "Samantha Allen via WalMart Tanks Program wmtanks@reynaldsbrothers.com",
            sentAt: "2026-05-04T15:14:48",
            matchConfidence: "review",
            reviewReason: "Home Office and Transportation are non-store locations; billing needs a separate project or expense card before filing.",
            displayUrl: "https://mail.google.com/mail/#all/19df38e814da5eee",
            attachmentNames: []
          },
          {
            gmailId: "19d49ef471511dd2",
            threadId: "19d49ef471511dd2",
            subject: "Apr 2026 Frontline Monthly Statement",
            sender: "Orders atomlinson@frontlineii.com",
            sentAt: "2026-04-01T16:45:01",
            matchConfidence: "review",
            reviewReason: "Monthly supplier statement spans multiple invoices and does not expose a single store, WO, or PO for filing.",
            displayUrl: "https://mail.google.com/mail/#all/19d49ef471511dd2",
            attachmentNames: ["Customer_Statement_C01659.pdf"]
          },
          {
            gmailId: "19d45ca4ec0c1b11",
            threadId: "19d45ca4ec0c1b11",
            subject: "Re: store: WM 1118 03-31-2026 skip@reynaldsbrothers.com ACC Walmart ACC UCO Work Completion [^]",
            sender: "Jotform via WalMart Tanks Program wmtanks@reynaldsbrothers.com",
            sentAt: "2026-03-31T21:26:16",
            storeNumber: "1118",
            matchConfidence: "review",
            reviewReason: "Jotform has store 1118 but the City/State field is incomplete or misspelled as Batch Springs with no state; confirm location before filing.",
            displayUrl: "https://mail.google.com/mail/#all/19d45ca4ec0c1b11",
            attachmentNames: ["6508015167215819863_signature_12.png", "1118-Replaced-electronic-depth-gages-with-Manuel-read-gagesl0.pdf"]
          },
          {
            gmailId: "19cf871d20d1a4eb",
            threadId: "19cf871d20d1a4eb",
            subject: "Contracts for permitting",
            sender: "John Nester john.nester@reynaldsbrothers.com",
            sentAt: "2026-03-16T20:58:40",
            matchConfidence: "review",
            reviewReason: "Email contains four separate permit-contract attachments for stores 942, 943, 2690, and 563; split by attachment/store before filing.",
            displayUrl: "https://mail.google.com/mail/#all/19cf871d20d1a4eb",
            attachmentNames: ["WM 942 Ocoee, FL.pdf", "WM 943 Casselberry, FL.pdf", "WM 2690 Madison, AL.pdf", "WM 563 Orange City, FL.pdf"]
          },
          {
            gmailId: "19cf7bbfebb716a7",
            threadId: "19cf7bbfebb716a7",
            subject: "Re: Store and LES notifications",
            sender: "Shay Reynalds shay@reynaldsbrothers.com",
            sentAt: "2026-03-16T17:39:41",
            matchConfidence: "review",
            reviewReason: "Route notification lists multiple upcoming store deliveries and service windows; split by store before filing.",
            displayUrl: "https://mail.google.com/mail/#all/19cf7bbfebb716a7",
            attachmentNames: []
          },
          {
            gmailId: "19cbed00c806ac3e",
            threadId: "19cbed00c806ac3e",
            subject: "Walmart 1590 Hialeah FL, Sam's Club 6217 (Miami Dade) Doral, FL invoices",
            sender: "Roy Payne via WalMart Tanks Program wmtanks@reynaldsbrothers.com",
            sentAt: "2026-03-05T16:23:42",
            matchConfidence: "review",
            reviewReason: "Invoice email spans two store projects and two PDF invoices; split by attachment/store before filing.",
            displayUrl: "https://mail.google.com/mail/#all/19cbed00c806ac3e",
            attachmentNames: ["192642.pdf", "192641.pdf"]
          },
          {
            gmailId: "19cbe9320c3af882",
            threadId: "19cbe9320c3af882",
            subject: "Mar 2026 Frontline Monthly Statement",
            sender: "Orders atomlinson@frontlineii.com",
            sentAt: "2026-03-05T15:17:07",
            matchConfidence: "review",
            reviewReason: "Monthly supplier statement spans multiple invoices and does not expose a single store, WO, or PO for filing.",
            displayUrl: "https://mail.google.com/mail/#all/19cbe9320c3af882",
            attachmentNames: ["Customer_Statement_C01659.pdf"]
          },
          {
            gmailId: "19c8d1e4cf3c117a",
            threadId: "19c8d1e4cf3c117a",
            subject: "Re: store: WM 5182 02-23-2026 jeremiah@reynaldsbrothers.com UCO Walmart ACC UCO Work Completion [^]",
            sender: "Jotform via Walmart Paperwork wmpw@reynaldsbrothers.com",
            sentAt: "2026-02-24T00:48:16",
            storeNumber: "5182",
            city: "Murfreesboro",
            matchConfidence: "review",
            reviewReason: "Jotform has store 5182 and Murfreesboro but no state in the sampled city/state field; confirm state before filing.",
            displayUrl: "https://mail.google.com/mail/#all/19c8d1e4cf3c117a",
            attachmentNames: ["6477032379921026269_signature_12.png", "5182-Removed-old-75-gal-uco-tank.pdf"]
          },
          {
            gmailId: "19c71336b052e81d",
            threadId: "19c7130eeec54a3c",
            subject: "Re: Exciting Addition to the AST-SPCC Program",
            sender: "Millie Wells millie@unitedinstallersplumbing.com",
            sentAt: "2026-02-18T14:41:47",
            matchConfidence: "review",
            reviewReason: "Program staffing announcement has no store, WO, PO, or job card target.",
            displayUrl: "https://mail.google.com/mail/#all/19c71336b052e81d",
            attachmentNames: []
          },
          {
            gmailId: "19c57a1706a0a290",
            threadId: "19c57a1706a0a290",
            subject: "Friday the 13th? Don't be unlucky when it comes to safety",
            sender: "SafetySign.com promotions@safetysign.com",
            sentAt: "2026-02-13T15:32:02",
            matchConfidence: "review",
            reviewReason: "Vendor marketing email has no store, WO, PO, or active job card target.",
            displayUrl: "https://mail.google.com/mail/#all/19c57a1706a0a290",
            attachmentNames: []
          }
        ]
      }
    }
  ];

  for (const object of rbObjects) {
    await prisma.rosObject.upsert({
      where: { id: object.id },
      update: object,
      create: {
        ...object,
        workspaceId: rbWorkspace.id
      }
    });
  }

  await prisma.timelineEvent.create({
    data: {
      workspaceId: rbWorkspace.id,
      objectId: "rb_wi_acc_1540",
      actorId: "usr_owner",
      eventType: "seed.created",
      summary: "Seed data created for Reynalds Brothers Work Item engine."
    }
  });

  await prisma.timelineEvent.create({
    data: {
      workspaceId: workspace.id,
      objectId: "obj_txn_smith",
      actorId: "usr_owner",
      eventType: "seed.created",
      summary: "Seed data created for Smith Transaction."
    }
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
