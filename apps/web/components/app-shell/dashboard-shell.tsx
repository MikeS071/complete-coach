"use client";

import { usePathname } from "next/navigation";

import { AuthSessionProvider } from "@/components/auth/auth-session-provider";
import { NotificationMenu } from "./notification-menu";
import { SidebarNav } from "./sidebar-nav";
import { TopSearch } from "./top-search";
import { UserMenu } from "./user-menu";

interface DashboardShellProps {
  children: React.ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
  const pathname = usePathname();

  return (
    <AuthSessionProvider>
      <div className="flex min-h-screen bg-gray-50 text-foreground">
        <SidebarNav currentPath={pathname} />
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-40 flex h-20 items-center justify-between gap-4 border-b border-border bg-white/95 px-8 backdrop-blur">
            <TopSearch />
            <div className="flex items-center gap-3">
              <NotificationMenu />
              <UserMenu />
            </div>
          </header>
          <main className="min-w-0 flex-1">{children}</main>
        </div>
      </div>
    </AuthSessionProvider>
  );
}
