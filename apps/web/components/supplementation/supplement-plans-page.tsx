"use client";

import { Edit, MoreVertical, Plus, TrendingUp } from "lucide-react";
import { useState } from "react";
import { activeSupplementProtocols, protocolLibrary } from "@/fixtures/supplementation";

type TabId = "active" | "library";

export function SupplementPlansPage() {
  const [activeTab, setActiveTab] = useState<TabId>("active");

  return (
    <main className="space-y-8 p-6 lg:p-8">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-black">Supplementation Hub</h1>
          <p className="text-sm text-slate-600">Manage client protocols and track compliance</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-orange-600">
          <Plus className="h-4 w-4" />
          Assign Plan
        </button>
      </header>

      <section className="grid gap-6 lg:grid-cols-3">
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">Protocol Compliance</h2>
            <TrendingUp className="h-4 w-4 text-indigo-600" />
          </div>
          <div className="mb-2 text-4xl font-black">94.2%</div>
          <div className="text-sm text-slate-500">37/39 clients adhering</div>
          <div className="mt-3 text-xs font-bold text-green-600">+2.3% from last month</div>
        </article>
        <article className="rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-700 p-6 text-white shadow-sm">
          <div className="text-sm font-bold uppercase tracking-wide text-indigo-200">Active Plans</div>
          <div className="mt-2 text-4xl font-black">5</div>
          <div className="text-sm text-indigo-200">Clients</div>
        </article>
        <article className="rounded-2xl bg-gradient-to-br from-purple-600 to-purple-700 p-6 text-white shadow-sm">
          <div className="text-sm font-bold uppercase tracking-wide text-purple-200">Library</div>
          <div className="mt-2 text-4xl font-black">12</div>
          <div className="text-sm text-purple-200">Protocols</div>
        </article>
      </section>

      <section>
        <div className="mb-6 flex flex-col gap-4 border-b border-slate-200 lg:flex-row lg:items-end lg:justify-between">
          <div role="tablist" aria-label="Supplement protocol sections" className="flex gap-8">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "active"}
              onClick={() => setActiveTab("active")}
              className={`border-b-2 pb-3 text-sm font-bold transition ${
                activeTab === "active" ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-600"
              }`}
            >
              Active Protocols
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "library"}
              onClick={() => setActiveTab("library")}
              className={`border-b-2 pb-3 text-sm font-bold transition ${
                activeTab === "library" ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-600"
              }`}
            >
              Protocol Library
            </button>
          </div>
          <div className="pb-3 text-sm font-bold text-indigo-600">
            {activeTab === "active" ? "View Detailed Reports ->" : "Vitamins  Performance  Recovery"}
          </div>
        </div>

        {activeTab === "active" ? (
          <div role="tabpanel" aria-label="Active Protocols" className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full min-w-[760px] text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs font-bold uppercase tracking-wide text-slate-600">
                <tr>
                  <th className="px-6 py-4">Client</th>
                  <th className="px-6 py-4">Primary Protocol</th>
                  <th className="px-6 py-4">Daily Stack</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Compliance</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {activeSupplementProtocols.map((protocol) => (
                  <tr key={protocol.id} className="border-b border-slate-100 last:border-0">
                    <td className="px-6 py-4 font-bold">{protocol.clientName}</td>
                    <td className="px-6 py-4">{protocol.protocol}</td>
                    <td className="px-6 py-4 text-slate-600">{protocol.supplements.join(", ")}</td>
                    <td className="px-6 py-4">
                      <span className={`rounded-full px-3 py-1 text-xs font-bold ${protocol.status === "Active" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}>
                        {protocol.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-24 rounded-full bg-slate-200">
                          <div className={`h-2 rounded-full ${protocol.compliance >= 90 ? "bg-green-600" : "bg-orange-600"}`} style={{ width: `${protocol.compliance}%` }} />
                        </div>
                        <span>{protocol.compliance}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button aria-label={`Edit ${protocol.clientName} protocol`} className="rounded-lg p-2 text-indigo-600 hover:bg-indigo-50">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button aria-label={`More actions for ${protocol.clientName}`} className="rounded-lg p-2 text-slate-600 hover:bg-slate-100">
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div role="tabpanel" aria-label="Protocol Library" className="grid gap-6 lg:grid-cols-3">
            {protocolLibrary.map((protocol) => (
              <article key={protocol.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-indigo-300 hover:shadow-lg">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-xl font-black text-indigo-700">
                    {protocol.name.slice(0, 1)}
                  </div>
                  <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600">{protocol.category}</span>
                </div>
                <h2 className="mb-2 font-black">{protocol.name}</h2>
                <p className="mb-4 text-sm leading-6 text-slate-600">{protocol.description}</p>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">{protocol.supplements} supplement{protocol.supplements === 1 ? "" : "s"}</span>
                  <button className="font-bold text-indigo-600">View Details -&gt;</button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
