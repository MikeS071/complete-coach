import { hash } from "bcryptjs";
import {
  ClientStatus,
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

main()
  .finally(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
