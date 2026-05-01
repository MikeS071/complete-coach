"use client";

import { Settings } from "lucide-react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

import { Button } from "@/components/ui/button";

function getInitials(name?: string | null, email?: string | null) {
  const source = name || email || "Coach";
  const words = source.split(/[\s@.]+/).filter(Boolean);

  return words
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");
}

export function UserMenu() {
  const { data: session, status } = useSession();

  if (status !== "authenticated" || !session?.user) {
    return (
      <div className="flex items-center gap-2">
        <Button type="button" variant="ghost" size="icon" aria-label="Settings" className="rounded-xl">
          <Settings className="size-5" aria-hidden="true" />
        </Button>
        <Button asChild className="rounded-xl bg-slate-900 px-4 text-white hover:bg-slate-800">
          <Link href="/sign-in">Sign in</Link>
        </Button>
      </div>
    );
  }

  const userLabel = session.user.name || session.user.email || "Signed-in coach";
  const organizationLabel = session.activeOrganization
    ? `${session.activeOrganization.name} · ${session.activeOrganization.role}`
    : "No active organization";

  return (
    <div className="flex items-center gap-2">
      <Button type="button" variant="ghost" size="icon" aria-label="Settings" className="rounded-xl">
        <Settings className="size-5" aria-hidden="true" />
      </Button>
      <div className="flex items-center gap-3 rounded-xl border border-border bg-white px-3 py-2">
        <span className="flex size-8 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
          {getInitials(session.user.name, session.user.email)}
        </span>
        <span className="hidden text-left md:block">
          <span className="block text-sm font-semibold leading-tight">{userLabel}</span>
          <span className="block text-xs text-muted-foreground">{organizationLabel}</span>
        </span>
      </div>
      <Button
        type="button"
        variant="outline"
        className="rounded-xl"
        onClick={() => {
          void signOut({ redirectTo: "/sign-in" });
        }}
      >
        Sign out
      </Button>
    </div>
  );
}
