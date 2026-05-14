import { hash } from "bcryptjs";
import {
  CheckInStatus,
  ClientStatus,
  FormAssignmentStatus,
  FormStatus,
  FormSubmissionStatus,
  FormType,
  LeadStage,
  LeadStatus,
  MembershipRole,
  MembershipStatus,
  PrismaClient
} from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { clients } from "../fixtures/clients";
import { leads } from "../fixtures/leads";

const databaseUrl = process.env.DATABASE_URL;
const demoEmail = process.env.DEMO_COACH_EMAIL;
const demoPassword = process.env.DEMO_COACH_PASSWORD;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required to seed Complete Coach data.");
}

const adapter = new PrismaPg({ connectionString: databaseUrl });
const prisma = new PrismaClient({ adapter });

async function main() {
  const organization = await prisma.organization.upsert({
    where: { slug: "complete-coach-demo" },
    update: {},
    create: {
      name: "Complete Coach Demo",
      slug: "complete-coach-demo",
      timezone: "Australia/Melbourne"
    }
  });

  if (!demoEmail || !demoPassword) {
    console.warn("Skipping demo user seed because DEMO_COACH_EMAIL or DEMO_COACH_PASSWORD is unset.");
    return;
  }

  const user = await prisma.user.upsert({
    where: { email: demoEmail.toLowerCase() },
    update: {
      passwordHash: await hash(demoPassword, 12)
    },
    create: {
      email: demoEmail.toLowerCase(),
      name: "Demo Coach",
      passwordHash: await hash(demoPassword, 12),
      authProvider: "credentials",
      authProviderAccountId: demoEmail.toLowerCase()
    }
  });

  await prisma.organizationMembership.upsert({
    where: {
      organizationId_userId: {
        organizationId: organization.id,
        userId: user.id
      }
    },
    update: {
      role: MembershipRole.OWNER,
      status: MembershipStatus.ACTIVE,
      joinedAt: new Date()
    },
    create: {
      organizationId: organization.id,
      userId: user.id,
      role: MembershipRole.OWNER,
      status: MembershipStatus.ACTIVE,
      joinedAt: new Date()
    }
  });

  const clientStatusMap = {
    active: ClientStatus.ACTIVE,
    archived: ClientStatus.ARCHIVED,
    new: ClientStatus.NEW,
    deactivated: ClientStatus.DEACTIVATED
  } as const;

  for (const client of clients) {
    const [firstName = client.name, ...lastNameParts] = client.name.split(" ");

    await prisma.client.upsert({
      where: { id: `demo-client-${client.id}` },
      update: {
        firstName,
        lastName: lastNameParts.join(" ") || "Client",
        status: clientStatusMap[client.status],
        packageName: client.packageName,
        checkInDay: client.checkInDay,
        compliance: client.compliance,
        externalClientId: `ext_demo_client_${client.id}`,
        primaryCoachUserId: user.id
      },
      create: {
        id: `demo-client-${client.id}`,
        organizationId: organization.id,
        firstName,
        lastName: lastNameParts.join(" ") || "Client",
        status: clientStatusMap[client.status],
        packageName: client.packageName,
        checkInDay: client.checkInDay,
        startDate: new Date(client.startDate),
        latestCheckInAt: new Date(client.latestCheckIn),
        compliance: client.compliance,
        externalClientId: `ext_demo_client_${client.id}`,
        primaryCoachUserId: user.id,
        profile: {
          create: {
            organizationId: organization.id,
            bio: client.bio,
            goals: [client.protocol],
            medicalNotes: null
          }
        }
      }
    });
  }

  await seedFormsCheckInsAndMetrics(organization.id, user.id);

  const leadStatusMap = {
    hot: LeadStatus.HOT,
    warm: LeadStatus.WARM,
    cold: LeadStatus.COLD
  } as const;

  const leadStageMap = {
    "initial-contact": LeadStage.INITIAL_CONTACT,
    consultation: LeadStage.CONSULTATION,
    proposal: LeadStage.PROPOSAL,
    negotiation: LeadStage.NEGOTIATION,
    "closed-won": LeadStage.CLOSED_WON
  } as const;

  for (const lead of leads) {
    await prisma.lead.upsert({
      where: { id: `demo-lead-${lead.id}` },
      update: {
        name: lead.name,
        email: lead.email.toLowerCase(),
        phone: lead.phone,
        source: lead.source,
        status: leadStatusMap[lead.status],
        stage: leadStageMap[lead.stage],
        location: lead.location,
        notes: lead.notes,
        daysInStage: lead.daysInStage,
        assignedUserId: user.id
      },
      create: {
        id: `demo-lead-${lead.id}`,
        organizationId: organization.id,
        name: lead.name,
        email: lead.email.toLowerCase(),
        phone: lead.phone,
        source: lead.source,
        status: leadStatusMap[lead.status],
        stage: leadStageMap[lead.stage],
        location: lead.location,
        notes: lead.notes,
        daysInStage: lead.daysInStage,
        assignedUserId: user.id,
        lastContactAt: new Date()
      }
    });
  }
}

async function seedFormsCheckInsAndMetrics(organizationId: string, userId: string) {
  const demoClient = clients[0];

  if (!demoClient) {
    return;
  }

  const clientId = `demo-client-${demoClient.id}`;
  const formId = "demo-weekly-check-in-form";
  const formVersionId = "demo-weekly-check-in-form-v1";
  const assignmentId = "demo-weekly-check-in-assignment";
  const submissionId = "demo-weekly-check-in-submission";
  const checkInId = "demo-weekly-check-in";
  const submittedAt = new Date("2026-05-14T08:30:00.000Z");

  const schemaJson = {
    title: "Weekly Performance Check-In",
    description: "Capture weekly bodyweight, energy, recovery, and notes.",
    fields: [
      {
        id: "body-weight",
        type: "number",
        label: "Body weight",
        required: true,
        metricKey: "body_weight",
        metricUnit: "kg",
        exportPolicy: "metric"
      },
      {
        id: "energy",
        type: "scale",
        label: "Energy score",
        required: true,
        metricKey: "energy_score",
        metricUnit: "score",
        exportPolicy: "metric"
      },
      {
        id: "notes",
        type: "long-text",
        label: "Private weekly notes",
        required: false,
        exportPolicy: "private"
      }
    ]
  };

  await prisma.form.upsert({
    where: { id: formId },
    update: {
      name: "Weekly Performance Check-In",
      description: "Capture weekly bodyweight, energy, recovery, and notes.",
      type: FormType.CHECK_IN,
      status: FormStatus.PUBLISHED,
      createdByUserId: userId
    },
    create: {
      id: formId,
      organizationId,
      name: "Weekly Performance Check-In",
      description: "Capture weekly bodyweight, energy, recovery, and notes.",
      type: FormType.CHECK_IN,
      status: FormStatus.PUBLISHED,
      createdByUserId: userId
    }
  });

  await prisma.formVersion.upsert({
    where: {
      formId_versionNumber: {
        formId,
        versionNumber: 1
      }
    },
    update: {
      schemaJson,
      uiJson: { primaryColor: "#6366f1", successMessage: "Thanks for submitting your check-in." },
      publishedAt: new Date("2026-05-01T00:00:00.000Z"),
      createdByUserId: userId
    },
    create: {
      id: formVersionId,
      organizationId,
      formId,
      versionNumber: 1,
      schemaJson,
      uiJson: { primaryColor: "#6366f1", successMessage: "Thanks for submitting your check-in." },
      publishedAt: new Date("2026-05-01T00:00:00.000Z"),
      createdByUserId: userId
    }
  });

  await prisma.form.update({
    where: { id: formId },
    data: { currentVersionId: formVersionId }
  });

  await prisma.formAssignment.upsert({
    where: { id: assignmentId },
    update: {
      formVersionId,
      clientId,
      status: FormAssignmentStatus.SUBMITTED,
      dueAt: new Date("2026-05-14T09:00:00.000Z")
    },
    create: {
      id: assignmentId,
      organizationId,
      formId,
      formVersionId,
      clientId,
      status: FormAssignmentStatus.SUBMITTED,
      dueAt: new Date("2026-05-14T09:00:00.000Z"),
      createdByUserId: userId
    }
  });

  await prisma.formSubmission.upsert({
    where: { id: submissionId },
    update: {
      answersJson: {
        "body-weight": 88.4,
        energy: 8,
        notes: "Feeling strong with mild soreness after lower session."
      },
      status: FormSubmissionStatus.SUBMITTED,
      submittedAt
    },
    create: {
      id: submissionId,
      organizationId,
      formId,
      formVersionId,
      assignmentId,
      clientId,
      submittedByUserId: userId,
      answersJson: {
        "body-weight": 88.4,
        energy: 8,
        notes: "Feeling strong with mild soreness after lower session."
      },
      status: FormSubmissionStatus.SUBMITTED,
      submittedAt
    }
  });

  await prisma.checkIn.upsert({
    where: { id: checkInId },
    update: {
      formSubmissionId: submissionId,
      status: CheckInStatus.PENDING_REVIEW,
      submittedAt,
      summary: "Weight and energy submitted for coach review."
    },
    create: {
      id: checkInId,
      organizationId,
      clientId,
      formSubmissionId: submissionId,
      status: CheckInStatus.PENDING_REVIEW,
      dueAt: new Date("2026-05-14T09:00:00.000Z"),
      submittedAt,
      summary: "Weight and energy submitted for coach review."
    }
  });

  await prisma.clientMeasurement.upsert({
    where: {
      organizationId_sourceType_sourceId_metricKey: {
        organizationId,
        sourceType: "form_submission",
        sourceId: submissionId,
        metricKey: "body_weight"
      }
    },
    update: {
      clientId,
      measuredAt: submittedAt,
      metricValue: 88.4,
      unit: "kg",
      metadata: { fieldId: "body-weight", label: "Body weight" }
    },
    create: {
      organizationId,
      clientId,
      sourceType: "form_submission",
      sourceId: submissionId,
      measuredAt: submittedAt,
      metricKey: "body_weight",
      metricValue: 88.4,
      unit: "kg",
      metadata: { fieldId: "body-weight", label: "Body weight" }
    }
  });

  await prisma.clientMeasurement.upsert({
    where: {
      organizationId_sourceType_sourceId_metricKey: {
        organizationId,
        sourceType: "form_submission",
        sourceId: submissionId,
        metricKey: "energy_score"
      }
    },
    update: {
      clientId,
      measuredAt: submittedAt,
      metricValue: 8,
      unit: "score",
      metadata: { fieldId: "energy", label: "Energy score" }
    },
    create: {
      organizationId,
      clientId,
      sourceType: "form_submission",
      sourceId: submissionId,
      measuredAt: submittedAt,
      metricKey: "energy_score",
      metricValue: 8,
      unit: "score",
      metadata: { fieldId: "energy", label: "Energy score" }
    }
  });
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
