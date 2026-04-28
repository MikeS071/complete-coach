import { PrismaAdapter } from "@auth/prisma-adapter";
import { compare } from "bcryptjs";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

import { credentialsSchema } from "@/lib/auth/credentials";
import type { MembershipRole } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db/prisma";
import { getServerEnv } from "@/lib/env";

export const { handlers, auth, signIn, signOut } = NextAuth(() => {
  const env = getServerEnv();

  return {
    adapter: PrismaAdapter(prisma),
    secret: env.AUTH_SECRET,
    trustHost: true,
    session: {
      strategy: "database" as const
    },
    providers: [
      Credentials({
        credentials: {
          email: { label: "Email", type: "email" },
          password: { label: "Password", type: "password" }
        },
        async authorize(credentials) {
          const parsed = credentialsSchema.safeParse(credentials);

          if (!parsed.success) {
            return null;
          }

          const user = await prisma.user.findUnique({
            where: { email: parsed.data.email }
          });

          if (!user?.passwordHash) {
            return null;
          }

          const validPassword = await compare(parsed.data.password, user.passwordHash);

          if (!validPassword) {
            return null;
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image
          };
        }
      })
    ],
    callbacks: {
      async session({ session, user }) {
        if (session.user) {
          session.user.id = user.id;
        }

        const membership = await prisma.organizationMembership.findFirst({
          where: {
            userId: user.id,
            status: "ACTIVE"
          },
          include: {
            organization: true
          },
          orderBy: {
            createdAt: "asc"
          }
        });

        if (membership) {
          session.activeOrganization = {
            id: membership.organizationId,
            slug: membership.organization.slug,
            name: membership.organization.name,
            role: membership.role.toLowerCase() as MembershipRole
          };
        }

        return session;
      }
    }
  };
});
