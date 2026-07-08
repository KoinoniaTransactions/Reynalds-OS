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
        workType: "Lower Bay Pressure Washing"
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
        workType: "Used Cooking Oil Tank Replacement"
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
        workType: "Grease Interceptor Alarm Installation"
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
