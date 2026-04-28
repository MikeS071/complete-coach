import { Filter, Plus, Search } from "lucide-react";

import { nutritionPlans, nutritionStats, recentMealLogs, type MealLog } from "@/fixtures/nutrition";
import { cn } from "@/lib/utils";

export function NutritionPage() {
  return (
    <div className="p-6 md:p-8">
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="mb-2 text-3xl font-bold">Nutrition Plans</h1>
          <p className="text-gray-600">Design meal plans and track client nutrition</p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 text-white transition-colors hover:bg-indigo-700">
          <Plus className="size-5" aria-hidden="true" />
          Create Meal Plan
        </button>
      </div>

      <div className="mb-8 grid gap-6 md:grid-cols-4">
        {nutritionStats.map((stat) => {
          const Icon = stat.icon;

          return (
            <section key={stat.label} className="rounded-xl border border-gray-200 bg-white p-6">
              <div className="mb-4">
                <div className={cn("flex size-12 items-center justify-center rounded-lg", stat.color)}>
                  <Icon className="size-6" aria-hidden="true" />
                </div>
              </div>
              <div className="mb-1 text-3xl font-bold">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </section>
          );
        })}
      </div>

      <div className="mb-6 flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" aria-hidden="true" />
          <input
            type="search"
            aria-label="Search meal plans"
            placeholder="Search meal plans..."
            className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <button className="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2.5 transition-colors hover:bg-gray-50">
          <Filter className="size-4" aria-hidden="true" />
          Filters
        </button>
      </div>

      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        {nutritionPlans.map((plan) => (
          <article key={plan.id} className="overflow-hidden rounded-xl border border-gray-200 bg-white transition-shadow hover:shadow-lg">
            <div className="relative flex h-40 items-center justify-center overflow-hidden bg-gradient-to-br from-green-500 to-emerald-600">
              <div className="absolute right-4 top-4 rounded-full bg-white/20 px-3 py-1 text-sm text-white backdrop-blur-sm">
                {plan.clients} athletes
              </div>
            </div>
            <div className="p-6">
              <h2 className="mb-3 text-lg font-bold">{plan.name}</h2>
              <div className="mb-4 rounded-lg bg-gray-50 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm text-gray-600">Daily Calories</span>
                  <span className="font-semibold">{plan.calories}</span>
                </div>
                <MacroBar label="Protein" value={plan.macros.protein} color="bg-blue-500" />
                <MacroBar label="Carbs" value={plan.macros.carbs} color="bg-green-500" />
                <MacroBar label="Fats" value={plan.macros.fats} color="bg-orange-500" />
              </div>
              <div className="mb-4">
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-gray-600">Adherence Rate</span>
                  <span className="font-medium text-green-600">{plan.adherence}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-100">
                  <div className="h-2 rounded-full bg-green-600" style={{ width: `${plan.adherence}%` }} />
                </div>
              </div>
              <div className="flex gap-2">
                <button className="flex-1 rounded-lg bg-indigo-600 py-2 text-white transition-colors hover:bg-indigo-700">
                  View Plan
                </button>
                <button className="rounded-lg border border-gray-200 px-4 transition-colors hover:bg-gray-50">Edit</button>
              </div>
            </div>
          </article>
        ))}
      </div>

      <section className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-bold">Recent Meal Logs</h2>
        <div className="space-y-4">
          {recentMealLogs.map((log) => (
            <MealLogRow key={`${log.client}-${log.time}`} log={log} />
          ))}
        </div>
      </section>
    </div>
  );
}

function MacroBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="mb-2 last:mb-0">
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="text-gray-600">{label}</span>
        <span className="font-medium">{value}%</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-gray-200">
        <div className={cn("h-1.5 rounded-full", color)} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function MealLogRow({ log }: { log: MealLog }) {
  const statusLabel =
    log.status === "on-track" ? "On Track" : log.status === "over" ? "Over Target" : "Under Target";
  const statusClass =
    log.status === "on-track"
      ? "bg-green-100 text-green-700"
      : log.status === "over"
        ? "bg-orange-100 text-orange-700"
        : "bg-blue-100 text-blue-700";

  return (
    <article className="flex items-center justify-between border-b border-gray-100 py-3 last:border-0">
      <div className="flex items-center gap-4">
        <div className="flex size-10 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold">
          {log.client
            .split(" ")
            .map((part) => part[0])
            .join("")}
        </div>
        <div>
          <div className="font-medium">{log.client}</div>
          <div className="text-sm text-gray-500">
            {log.meal} - {log.calories} cal
          </div>
        </div>
      </div>
      <div className="flex items-center gap-6">
        <span className="text-sm text-gray-500">{log.time}</span>
        <span className={cn("rounded-full px-3 py-1 text-xs font-medium", statusClass)}>{statusLabel}</span>
      </div>
    </article>
  );
}
