import { dashboardTeamMembers } from "@/fixtures/dashboard";
import { cn } from "@/lib/utils";

export function ClientCapacityCard() {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-6 transition-all hover:border-indigo-200 hover:shadow-lg">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-xs uppercase tracking-wider text-gray-500">Client Capacity</span>
        <span className="rounded bg-indigo-100 px-2 py-1 text-xs text-indigo-700">50% LOAD</span>
      </div>
      <div className="mb-4">
        <span className="text-3xl font-bold">42</span>
        <span className="text-xl text-gray-400">/84</span>
      </div>
      <div className="mb-2 h-3 w-full rounded-full bg-gray-100">
        <div className="h-3 rounded-full bg-indigo-600" style={{ width: "50%" }} />
      </div>
      <p className="text-xs text-gray-500">Room for 42 more premium athletes</p>
    </section>
  );
}

export function PriorityTasksCard() {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-6 transition-all hover:border-indigo-200 hover:shadow-lg">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-xs uppercase tracking-wider text-gray-500">Check Ins</span>
        <span className="size-2 rounded-full bg-orange-500" aria-label="Needs attention" />
      </div>
      <div className="mb-6">
        <span className="text-3xl font-bold">5</span>
        <span className="text-xl text-gray-400"> Pending</span>
      </div>
      <div className="rounded-lg bg-orange-50 p-3 text-center">
        <div className="mb-1 text-2xl font-bold text-orange-600">5</div>
        <div className="text-xs uppercase tracking-wider text-gray-600">Checks</div>
      </div>
    </section>
  );
}

export function TeamSnapshotCard() {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5" aria-label="Coach Team">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold">Coach Team</h2>
        <span className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-600">
          {dashboardTeamMembers.length} active
        </span>
      </div>
      <div className="flex -space-x-3">
        {dashboardTeamMembers.map((member) => (
          <div
            key={member.id}
            title={`${member.name}, ${member.role}`}
            className={cn(
              "flex size-11 items-center justify-center rounded-full border-2 border-white text-xs font-semibold text-white shadow-sm",
              member.color
            )}
          >
            {member.initials}
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs text-gray-500">Coverage is balanced across nutrition, care, and performance.</p>
    </section>
  );
}
