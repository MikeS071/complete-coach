import { Settings } from "lucide-react";

import { Button } from "@/components/ui/button";

export function UserMenu() {
  return (
    <div className="flex items-center gap-2">
      <Button type="button" variant="ghost" size="icon" aria-label="Settings" className="rounded-xl">
        <Settings className="size-5" aria-hidden="true" />
      </Button>
      <div className="flex items-center gap-3 rounded-xl border border-border bg-white px-3 py-2">
        <span className="flex size-8 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
          CM
        </span>
        <span className="hidden text-left md:block">
          <span className="block text-sm font-semibold leading-tight">Coach Marcus</span>
          <span className="block text-xs text-muted-foreground">Pro Account</span>
        </span>
      </div>
    </div>
  );
}
