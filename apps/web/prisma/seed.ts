import { hash } from "bcryptjs";
import { PrismaClient, MembershipRole, MembershipStatus } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

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
