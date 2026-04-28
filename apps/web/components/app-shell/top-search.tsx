import { Search } from "lucide-react";

export function TopSearch() {
  return (
    <form className="relative w-full max-w-md" role="search">
      <label className="sr-only" htmlFor="global-search">
        Search tasks, clients, or pipeline
      </label>
      <Search
        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
      <input
        id="global-search"
        type="search"
        placeholder="Search tasks, clients, or pipeline"
        className="h-10 w-full rounded-full border border-transparent bg-muted px-10 text-sm outline-none transition-[border,box-shadow] placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/40"
      />
    </form>
  );
}
