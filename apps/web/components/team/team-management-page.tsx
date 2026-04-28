import { CheckCircle, Clock, Mail, MoreVertical, Phone, UserPlus } from "lucide-react";
import { teamMembers, teamTasks } from "@/fixtures/operations";

export function TeamManagementPage() {
  const activeCoaches = teamMembers.filter((member) => member.status === "active" && member.clients > 0).length;
  const totalClients = teamMembers.reduce((sum, member) => sum + member.clients, 0);
  const averageLoad = Math.round(teamMembers.reduce((sum, member) => sum + member.load, 0) / teamMembers.length);

  return (
    <main className="space-y-8 p-6 lg:p-8">
      <header>
        <h1 className="mb-2 text-3xl font-black">Team Management</h1>
        <p className="text-sm text-slate-600">Manage your coaching team and coordinate workloads.</p>
      </header>

      <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Total Team Members", teamMembers.length],
          ["Active Coaches", activeCoaches],
          ["Total Clients", totalClients],
          ["Avg. Load", `${averageLoad}%`]
        ].map(([label, value]) => (
          <article key={String(label)} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">{label}</div>
            <div className="text-3xl font-black">{value}</div>
          </article>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-black">Team Members</h2>
            <button className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-indigo-700">
              <UserPlus className="h-4 w-4" />
              Add Member
            </button>
          </div>
          <div className="space-y-4">
            {teamMembers.map((member) => (
              <article key={member.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 font-black text-white">
                    {member.name
                      .split(" ")
                      .map((part) => part[0])
                      .join("")}
                  </div>
                  <div className="flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <h3 className="font-black">{member.name}</h3>
                      <span className={`rounded-md px-2 py-1 text-xs font-bold ${member.status === "active" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                        {member.status}
                      </span>
                    </div>
                    <p className="mb-3 text-sm text-slate-600">{member.role}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                      <span className="inline-flex items-center gap-1">
                        <Mail className="h-4 w-4" />
                        {member.email}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Phone className="h-4 w-4" />
                        {member.phone}
                      </span>
                    </div>
                  </div>
                  <div className="text-left lg:text-right">
                    <div className="text-2xl font-black text-indigo-600">{member.clients}</div>
                    <div className="text-xs text-slate-500">Clients</div>
                  </div>
                  <button aria-label={`More actions for ${member.name}`} className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100">
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>

        <aside>
          <h2 className="mb-4 text-xl font-black">Assigned Tasks</h2>
          <div className="mb-6 space-y-3">
            {teamTasks.map((task) => (
              <article key={task.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-start gap-2">
                  <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-slate-300" />
                  <div>
                    <p className="mb-1 text-sm font-bold">{task.task}</p>
                    <p className="mb-2 text-xs text-slate-500">{task.assignee}</p>
                    <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                      <Clock className="h-3 w-3" />
                      {task.dueDate}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <button className="mb-4 w-full rounded-xl bg-slate-950 py-3 text-sm font-black text-white transition hover:bg-slate-800">
            VIEW ALL TASKS
          </button>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="mb-3 text-sm font-black">Team Capacity</h3>
            <div className="space-y-3">
              {teamMembers
                .filter((member) => member.clients > 0)
                .map((member) => (
                  <div key={member.id}>
                    <div className="mb-1 flex justify-between text-xs">
                      <span className="text-slate-600">{member.name}</span>
                      <span className="font-bold">{member.load}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100">
                      <div className={`h-2 rounded-full ${member.load > 90 ? "bg-orange-500" : member.load > 70 ? "bg-indigo-600" : "bg-green-500"}`} style={{ width: `${member.load}%` }} />
                    </div>
                  </div>
                ))}
            </div>
          </section>
        </aside>
      </section>
    </main>
  );
}
