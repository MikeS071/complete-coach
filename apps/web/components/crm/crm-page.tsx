"use client";

import { Calendar, Clock, GripVertical, Mail, MapPin, Phone, Plus, Search, Tag } from "lucide-react";
import { useState } from "react";

import { leads as leadFixtures, pipelineStages, type Lead, type LeadStageId, type LeadStatus } from "@/fixtures/leads";
import { cn } from "@/lib/utils";

const statusConfig: Record<LeadStatus, { label: string; className: string }> = {
  hot: { label: "Hot", className: "border-red-200 bg-red-100 text-red-700" },
  warm: { label: "Warm", className: "border-yellow-200 bg-yellow-100 text-yellow-700" },
  cold: { label: "Cold", className: "border-blue-200 bg-blue-100 text-blue-700" }
};

export function CRMPage() {
  const [leads, setLeads] = useState<Lead[]>(leadFixtures);
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);

  const moveLead = (leadId: string, stageId: LeadStageId) => {
    setLeads((currentLeads) =>
      currentLeads.map((lead) => (lead.id === leadId ? { ...lead, stage: stageId, daysInStage: 0 } : lead))
    );
    setDraggedLeadId(null);
  };

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">Client Relationship Management</h1>
        <p className="text-gray-600">Manage leads and track client acquisition pipeline</p>
      </div>

      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div className="relative">
          <label htmlFor="lead-search" className="sr-only">
            Search leads
          </label>
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" aria-hidden="true" />
          <input
            id="lead-search"
            type="search"
            placeholder="Search leads..."
            className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 md:w-80"
          />
        </div>

        <button className="flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-white transition-colors hover:bg-indigo-700">
          <Plus className="size-4" aria-hidden="true" />
          Add New Lead
        </button>
      </div>

      <div className="mb-8 grid gap-6 md:grid-cols-4">
        <CRMStat label="Total Leads" value={leads.length} tone="text-gray-900" />
        <CRMStat label="Hot Leads" value={leads.filter((lead) => lead.status === "hot").length} tone="text-red-600" />
        <CRMStat label="Warm Leads" value={leads.filter((lead) => lead.status === "warm").length} tone="text-yellow-600" />
        <CRMStat label="Cold Leads" value={leads.filter((lead) => lead.status === "cold").length} tone="text-blue-600" />
      </div>

      <div className="overflow-x-auto pb-4">
        <div className="flex min-h-[600px] gap-4">
          {pipelineStages.map((stage) => {
            const stageLeads = leads.filter((lead) => lead.stage === stage.id);

            return (
              <section
                key={stage.id}
                aria-label={stage.title}
                className={cn("flex min-w-80 flex-col rounded-xl border border-gray-200 p-4", stage.color)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => {
                  if (draggedLeadId) {
                    moveLead(draggedLeadId, stage.id);
                  }
                }}
              >
                <div className="mb-4">
                  <h2 className="mb-1 font-semibold text-gray-900">{stage.title}</h2>
                  <p className="text-xs text-gray-500">
                    {stageLeads.length} lead{stageLeads.length === 1 ? "" : "s"}
                  </p>
                </div>

                <div className="flex-1 space-y-3 overflow-y-auto">
                  {stageLeads.map((lead) => (
                    <LeadCard key={lead.id} lead={lead} currentStage={stage.id} onMove={moveLead} onDragStart={setDraggedLeadId} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function CRMStat({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="mb-2 text-xs uppercase tracking-wider text-gray-500">{label}</div>
      <div className={cn("text-3xl font-bold", tone)}>{value}</div>
    </section>
  );
}

function LeadCard({
  lead,
  currentStage,
  onMove,
  onDragStart
}: {
  lead: Lead;
  currentStage: LeadStageId;
  onMove: (leadId: string, stageId: LeadStageId) => void;
  onDragStart: (leadId: string) => void;
}) {
  const status = statusConfig[lead.status];
  const nextStages = pipelineStages.filter((stage) => stage.id !== currentStage);

  return (
    <article
      draggable
      className="cursor-move rounded-lg border-2 border-gray-200 bg-white p-4 transition-all hover:shadow-lg"
      onDragStart={() => onDragStart(lead.id)}
    >
      <div className="mb-3 flex items-start gap-3">
        <GripVertical className="mt-1 size-4 shrink-0 text-gray-400" aria-hidden="true" />
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-semibold text-white">
          {lead.initials}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-semibold text-gray-900">{lead.name}</h3>
          <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-500">
            <MapPin className="size-3" aria-hidden="true" />
            {lead.location}
          </p>
        </div>
        <span className={cn("shrink-0 rounded border px-2 py-1 text-xs font-medium", status.className)}>
          {status.label}
        </span>
      </div>

      <p className="mb-3 text-sm text-gray-600">{lead.notes}</p>

      <div className="mb-3 space-y-1.5 text-xs">
        <p className="flex items-center gap-2 text-gray-600">
          <Mail className="size-3.5 shrink-0" aria-hidden="true" />
          <span className="truncate">{lead.email}</span>
        </p>
        <p className="flex items-center gap-2 text-gray-600">
          <Phone className="size-3.5 shrink-0" aria-hidden="true" />
          <span>{lead.phone}</span>
        </p>
      </div>

      <div className="flex items-center justify-between border-t border-gray-100 pt-3">
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Tag className="size-3.5" aria-hidden="true" />
            {lead.source}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="size-3.5" aria-hidden="true" />
            {lead.daysInStage}d
          </span>
        </div>
      </div>

      <p className="mt-2 border-t border-gray-100 pt-2 text-xs text-gray-500">
        Last contact: <span className="font-medium text-gray-700">{lead.lastContact}</span>
      </p>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <button className="flex items-center justify-center gap-1 rounded bg-indigo-50 py-1.5 text-indigo-600 transition-colors hover:bg-indigo-100">
          <Mail className="size-3.5" aria-hidden="true" />
          <span className="text-xs font-medium">Email</span>
        </button>
        <button className="flex items-center justify-center gap-1 rounded bg-green-50 py-1.5 text-green-600 transition-colors hover:bg-green-100">
          <Phone className="size-3.5" aria-hidden="true" />
          <span className="text-xs font-medium">Call</span>
        </button>
      </div>

      <div className="mt-2">
        <label htmlFor={`move-${lead.id}`} className="sr-only">
          Move {lead.name}
        </label>
        <select
          id={`move-${lead.id}`}
          className="w-full rounded border border-gray-200 bg-white px-2 py-1.5 text-xs text-gray-600"
          value=""
          onChange={(event) => onMove(lead.id, event.target.value as LeadStageId)}
        >
          <option value="" disabled>
            Move stage
          </option>
          {nextStages.map((stage) => (
            <option key={stage.id} value={stage.id}>
              {stage.title}
            </option>
          ))}
        </select>
      </div>

      <div className="sr-only">
        {nextStages.map((stage) => (
          <button key={stage.id} type="button" onClick={() => onMove(lead.id, stage.id)}>
            Move {lead.name} to {stage.title}
          </button>
        ))}
      </div>

      <button type="button" className="sr-only">
        <Calendar className="size-3.5" aria-hidden="true" />
        Schedule follow-up
      </button>
    </article>
  );
}
