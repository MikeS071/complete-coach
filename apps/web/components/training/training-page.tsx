import { Filter, Plus, Search, TrendingUp } from "lucide-react";

import { recentWorkouts, trainingPrograms, trainingStats } from "@/fixtures/training";
import { cn } from "@/lib/utils";

export function TrainingPage() {
  return (
    <div className="p-6 md:p-8">
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="mb-2 text-3xl font-bold">Training Programs</h1>
          <p className="text-gray-600">Manage workout plans and track athlete progress</p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 text-white transition-colors hover:bg-indigo-700">
          <Plus className="size-5" aria-hidden="true" />
          Create Program
        </button>
      </div>

      <div className="mb-8 grid gap-6 md:grid-cols-4">
        {trainingStats.map((stat) => {
          const Icon = stat.icon;

          return (
            <section key={stat.label} className="rounded-xl border border-gray-200 bg-white p-6">
              <div className="mb-4 flex items-center justify-between">
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
            aria-label="Search programs"
            placeholder="Search programs..."
            className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <button className="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2.5 transition-colors hover:bg-gray-50">
          <Filter className="size-4" aria-hidden="true" />
          Filters
        </button>
      </div>

      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        {trainingPrograms.map((program) => (
          <article key={program.id} className="overflow-hidden rounded-xl border border-gray-200 bg-white transition-shadow hover:shadow-lg">
            <div className="relative flex h-40 items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600">
              <div className="absolute right-4 top-4 rounded-full bg-white/20 px-3 py-1 text-sm text-white backdrop-blur-sm">
                {program.clients} athletes
              </div>
            </div>
            <div className="p-6">
              <h2 className="mb-2 text-lg font-bold">{program.name}</h2>
              <div className="mb-4 flex items-center gap-4 text-sm text-gray-600">
                <span>{program.duration}</span>
                <span aria-hidden="true">-</span>
                <span>{program.nextSession}</span>
              </div>
              <div className="mb-4">
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-gray-600">Progress</span>
                  <span className="font-medium">{program.progress}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-100">
                  <div className="h-2 rounded-full bg-indigo-600" style={{ width: `${program.progress}%` }} />
                </div>
              </div>
              <div className="flex gap-2">
                <button className="flex-1 rounded-lg bg-indigo-600 py-2 text-white transition-colors hover:bg-indigo-700">
                  View Details
                </button>
                <button className="rounded-lg border border-gray-200 px-4 transition-colors hover:bg-gray-50">Edit</button>
              </div>
            </div>
          </article>
        ))}
      </div>

      <section className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-bold">Recent Workout Completions</h2>
        <div className="space-y-4">
          {recentWorkouts.map((workout) => (
            <article key={`${workout.client}-${workout.date}`} className="flex items-center justify-between border-b border-gray-100 py-3 last:border-0">
              <div className="flex items-center gap-4">
                <div className="flex size-10 items-center justify-center rounded-full bg-gray-100">
                  <span className="text-sm font-semibold">
                    {workout.client
                      .split(" ")
                      .map((part) => part[0])
                      .join("")}
                  </span>
                </div>
                <div>
                  <div className="font-medium">{workout.client}</div>
                  <div className="text-sm text-gray-500">{workout.program}</div>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <span className="text-sm text-gray-500">{workout.date}</span>
                <div className={cn("flex items-center gap-1", workout.trend === "up" ? "text-green-600" : "text-red-600")}>
                  <TrendingUp className={cn("size-4", workout.trend === "down" && "rotate-180")} aria-hidden="true" />
                  <span className="font-medium">{workout.performance}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
