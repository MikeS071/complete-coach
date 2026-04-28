import type { DefaultSession } from "next-auth";
import type { MembershipRole } from "@/lib/auth/permissions";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
    activeOrganization?: {
      id: string;
      slug: string;
      name: string;
      role: MembershipRole;
    };
  }
}
