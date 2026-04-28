"use client";

import { Calendar, Edit, Filter, MoreVertical, Plus, Search, Users, Zap } from "lucide-react";
import { useState } from "react";

import { assignedPrograms, programTemplates } from "@/fixtures/training";
import { cn } from "@/lib/utils";

type ProgramTab = "Active Client Programs" | "Master Templates";

export function TrainingProgramsPage() {
  const [activeTab, setActiveTab] = useState<ProgramTab>("Active Client Programs");

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <div className="mb-4 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="mb-2 text-3xl font-bold">Program Library</h1>
            <p className="text-gray-600">Manage and organize your coaching templates.</p>
          </div>
          <button className="flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-white transition-colors hover:bg-indigo-700">
            <Plus className="size-4" aria-hidden="true" />
            Create New Program
          </button>
        </div>
      </div>

      <div role="tablist" aria-label="Program library sections" className="mb-8 flex items-center gap-8 border-b border-gray-200">
        {(["Active Client Programs", "Master Templates"] as ProgramTab[]).map((tab) => (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={activeTab === tab}
            className={cn(
              "border-b-2 pb-3 text-sm font-medium transition-colors",
              activeTab === tab ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-600 hover:text-gray-900"
            )}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "Active Client Programs" ? <ActiveProgramsPanel /> : <TemplatesPanel />}
    </div>
  );
}

function ActiveProgramsPanel() {
  return (
    <section role="tabpanel" aria-label="Active Client Programs">
      <div className="mb-6 flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" aria-hidden="true" />
          <input
            type="search"
            aria-label="Search active programs"
            placeholder="Search programs..."
            className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <button className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm transition-colors hover:bg-gray-50">
          <Filter className="size-4" aria-hidden="true" />
          Filters
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="grid grid-cols-12 gap-4 border-b border-gray-200 bg-gray-50 px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-600">
          <div className="col-span-4">Program Name</div>
          <div className="col-span-3">Assigned Client</div>
          <div className="col-span-2">Progress</div>
          <div className="col-span-2">Last Edited</div>
          <div className="col-span-1">Actions</div>
        </div>
        {assignedPrograms.map((program) => (
          <article key={program.id} className="grid grid-cols-12 items-center gap-4 border-b border-gray-100 px-6 py-4 last:border-0 hover:bg-gray-50">
            <div className="col-span-4 flex items-center gap-3">
              <div className={cn("flex size-10 items-center justify-center rounded-lg font-bold", program.color)}>
                {program.icon}
              </div>
              <div>
                <div className="font-medium text-gray-900">{program.name}</div>
                <div className="text-xs text-gray-500">
                  {program.weeksTotal} weeks - Started {program.startDate}
                </div>
              </div>
            </div>
            <div className="col-span-3 text-sm text-gray-700">{program.clientName}</div>
            <div className="col-span-2 flex items-center gap-2">
              <div className="h-2 max-w-28 flex-1 rounded-full bg-gray-200">
                <div className="h-2 rounded-full bg-indigo-600" style={{ width: `${program.progress}%` }} />
              </div>
              <span className="text-xs text-gray-600">{program.progress}%</span>
            </div>
            <div className="col-span-2 text-sm text-gray-600">{program.lastEdited}</div>
            <div className="col-span-1 flex items-center gap-2">
              <button aria-label={`Edit ${program.name}`} className="rounded-lg p-2 text-indigo-600 hover:bg-indigo-50">
                <Edit className="size-4" aria-hidden="true" />
              </button>
              <button aria-label={`More actions for ${program.name}`} className="rounded-lg p-2 text-gray-600 hover:bg-gray-100">
                <MoreVertical className="size-4" aria-hidden="true" />
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function TemplatesPanel() {
  return (
    <section role="tabpanel" aria-label="Master Templates">
      <div className="mb-6 flex items-center gap-3">
        {["All", "Strength", "Endurance"].map((filter) => (
          <button key={filter} className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm transition-colors hover:bg-gray-50">
            {filter}
          </button>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {programTemplates.map((template) => (
          <article key={template.id} className="group overflow-hidden rounded-xl border border-gray-200 bg-white transition-all hover:border-indigo-300 hover:shadow-lg">
            <div className={cn("relative p-6 text-white", template.color)}>
              <div className="absolute right-3 top-3 rounded bg-white/20 px-2 py-1 text-xs font-medium backdrop-blur-sm">
                {template.badge}
              </div>
              <div className="mb-2 flex items-center gap-2">
                <Zap className="size-5" aria-hidden="true" />
                <h2 className="text-lg font-bold">{template.name}</h2>
              </div>
              <p className="text-sm text-white/90">{template.description}</p>
            </div>
            <div className="p-5">
              <div className="mb-4 flex items-center justify-between text-sm">
                <div className="flex items-center gap-1 text-gray-600">
                  <Users className="size-4" aria-hidden="true" />
                  {template.uses} clients
                </div>
                <div className="flex items-center gap-1 text-gray-600">
                  <Calendar className="size-4" aria-hidden="true" />
                  {template.weeks} weeks
                </div>
              </div>
              <button className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-700">
                Use Template
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
