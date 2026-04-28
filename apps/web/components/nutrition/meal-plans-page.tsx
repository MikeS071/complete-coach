"use client";

import { Calendar, Download, Edit, MoreVertical, Plus } from "lucide-react";
import { useState } from "react";

import { mealAssignments, mealTemplates } from "@/fixtures/nutrition";
import { cn } from "@/lib/utils";

type MealPlanTab = "Active Client Assignments" | "Master Nutrition Templates";

export function MealPlansPage() {
  const [activeTab, setActiveTab] = useState<MealPlanTab>("Active Client Assignments");

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <div className="mb-6 flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
          <div>
            <h1 className="mb-2 text-3xl font-bold">Meal Plan Library</h1>
            <p className="text-gray-600">Manage client nutrition protocols</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {["Recipes", "Keto", "Low", "Moderate", "High"].map((label) => (
              <button
                key={label}
                className={cn(
                  "rounded-lg px-4 py-2.5 text-sm transition-colors",
                  label === "Recipes"
                    ? "bg-orange-500 text-white hover:bg-orange-600"
                    : "border border-gray-200 bg-white hover:bg-gray-50"
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <section className="mb-8 flex h-64 items-center justify-between overflow-hidden rounded-2xl bg-gradient-to-r from-green-600 to-green-700 p-8">
          <div className="text-white">
            <h2 className="mb-2 text-3xl font-bold">Master Nutrition Protocol 2024</h2>
            <p className="text-lg text-green-100">Complete evidence-based meal planning system</p>
          </div>
          <button className="flex items-center gap-2 rounded-lg bg-white px-6 py-3 font-medium text-green-700 transition-colors hover:bg-green-50">
            <Download className="size-4" aria-hidden="true" />
            Access Protocol
          </button>
        </section>
      </div>

      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div role="tablist" aria-label="Meal plan sections" className="flex items-center gap-8 border-b border-gray-200">
          {(["Active Client Assignments", "Master Nutrition Templates"] as MealPlanTab[]).map((tab) => (
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
        {activeTab === "Active Client Assignments" ? (
          <button className="text-sm font-medium text-indigo-600 hover:text-indigo-700">View All Active</button>
        ) : null}
      </div>

      {activeTab === "Active Client Assignments" ? <ActiveAssignmentsPanel /> : <MasterTemplatesPanel />}
    </div>
  );
}

function ActiveAssignmentsPanel() {
  return (
    <section role="tabpanel" aria-label="Active Client Assignments" className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <div className="grid grid-cols-12 gap-4 border-b border-gray-200 bg-gray-50 px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-600">
        <div className="col-span-3">Assigned Client</div>
        <div className="col-span-3">Meal Plan Protocol</div>
        <div className="col-span-1">Calories</div>
        <div className="col-span-1">Protein</div>
        <div className="col-span-1">Carbs</div>
        <div className="col-span-1">Fats</div>
        <div className="col-span-1">Started</div>
        <div className="col-span-1">Actions</div>
      </div>
      {mealAssignments.map((assignment) => (
        <article key={assignment.id} className="grid grid-cols-12 items-center gap-4 border-b border-gray-100 px-6 py-4 last:border-0 hover:bg-gray-50">
          <div className="col-span-3 font-medium text-gray-900">{assignment.clientName}</div>
          <div className="col-span-3 text-sm text-gray-700">{assignment.planName}</div>
          <div className="col-span-1 text-sm text-gray-700">{assignment.calories}</div>
          <div className="col-span-1 text-sm font-medium text-blue-600">{assignment.protein}g</div>
          <div className="col-span-1 text-sm font-medium text-green-600">{assignment.carbs}g</div>
          <div className="col-span-1 text-sm font-medium text-orange-600">{assignment.fats}g</div>
          <div className="col-span-1 text-sm text-gray-600">{assignment.started}</div>
          <div className="col-span-1 flex items-center gap-2">
            <button aria-label={`Edit ${assignment.planName}`} className="rounded-lg p-2 text-indigo-600 hover:bg-indigo-50">
              <Edit className="size-4" aria-hidden="true" />
            </button>
            <button aria-label={`More actions for ${assignment.planName}`} className="rounded-lg p-2 text-gray-600 hover:bg-gray-100">
              <MoreVertical className="size-4" aria-hidden="true" />
            </button>
          </div>
        </article>
      ))}
    </section>
  );
}

function MasterTemplatesPanel() {
  return (
    <section role="tabpanel" aria-label="Master Nutrition Templates">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {["All", "Strength", "Endurance"].map((filter) => (
            <button key={filter} className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm transition-colors hover:bg-gray-50">
              {filter}
            </button>
          ))}
        </div>
        <button className="text-sm font-medium text-indigo-600 hover:text-indigo-700">View All</button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {mealTemplates.map((template) => (
          <article key={template.id} className="overflow-hidden rounded-xl border border-gray-200 bg-white transition-all hover:border-indigo-300 hover:shadow-lg">
            <div className="h-48 bg-gradient-to-br from-green-700 to-emerald-500" />
            <div className="p-5">
              <h2 className="mb-1 font-bold text-gray-900">{template.name}</h2>
              <p className="mb-4 text-sm text-gray-500">{template.description}</p>
              <div className="mb-4 flex items-center justify-between text-sm">
                <div className="flex items-center gap-1 text-gray-600">
                  <Calendar className="size-4 text-gray-400" aria-hidden="true" />
                  {template.calories} cal
                </div>
              </div>
              <div className="mb-4 flex items-center gap-4 text-xs">
                <Macro label="PRO" value={`${template.protein}g`} tone="text-blue-600" />
                <Macro label="CARB" value={`${template.carbs}g`} tone="text-green-600" />
                <Macro label="FAT" value={`${template.fats}g`} tone="text-orange-600" />
              </div>
              <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-700">
                <Plus className="size-4" aria-hidden="true" />
                Use Template
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function Macro({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div>
      <span className={cn("font-medium", tone)}>{value}</span>
      <span className="ml-1 text-gray-500">{label}</span>
    </div>
  );
}
