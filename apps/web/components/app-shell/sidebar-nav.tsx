import Link from "next/link";
import { Zap } from "lucide-react";
import type { Route } from "next";

import { cn } from "@/lib/utils";
import { isActivePath, navigationItems } from "./navigation";

interface SidebarNavProps {
  currentPath: string;
}

export function SidebarNav({ currentPath }: SidebarNavProps) {
  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-border bg-sidebar">
      <div className="border-b border-sidebar-border p-5">
        <Link href="/" className="flex items-center gap-3" aria-label="Complete Coach dashboard">
          <span className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-700 text-white shadow-sm">
            <Zap className="size-5" aria-hidden="true" />
          </span>
          <span>
            <span className="block text-base font-bold tracking-tight">Complete Coach</span>
            <span className="block text-xs uppercase tracking-[0.22em] text-muted-foreground">
              Elite Performance
            </span>
          </span>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3" aria-label="Primary navigation">
        {navigationItems.map((item) => {
          const active = isActivePath(currentPath, item.href);
          const Icon = item.icon;

          return (
            <div key={item.href}>
              <Link
                href={item.href as Route}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <Icon className="size-4" aria-hidden="true" />
                <span>{item.label}</span>
              </Link>

              {item.children ? (
                <div className="ml-4 mt-1 space-y-1 border-l border-sidebar-border pl-3">
                  {item.children.map((child) => {
                    const childActive = isActivePath(currentPath, child.href);
                    const ChildIcon = child.icon;

                    return (
                      <Link
                        key={child.href}
                        href={child.href as Route}
                        aria-current={childActive ? "page" : undefined}
                        className={cn(
                          "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                          childActive
                            ? "bg-indigo-50 text-indigo-700"
                            : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                        )}
                      >
                        <ChildIcon className="size-4" aria-hidden="true" />
                        <span>{child.label}</span>
                      </Link>
                    );
                  })}
                </div>
              ) : null}
            </div>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border p-4">
        <button className="mb-4 w-full rounded-xl bg-indigo-700 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-800">
          + New Client
        </button>
        <div className="rounded-xl border border-sidebar-border bg-white p-3">
          <p className="font-semibold">Coach Marcus</p>
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Head Curator</p>
        </div>
      </div>
    </aside>
  );
}
