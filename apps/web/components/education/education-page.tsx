"use client";

import { ChevronRight, Play, Plus } from "lucide-react";
import { useState } from "react";
import { educationResources, educationTabs, featuredEducationResource } from "@/fixtures/education";

export function EducationPage() {
  const [activeTab, setActiveTab] = useState<(typeof educationTabs)[number]>("All Content");

  return (
    <main className="space-y-8 p-6 lg:p-8">
      <header className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl">
          <h1 className="mb-3 text-4xl font-black tracking-tight">
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Educational Vault
            </span>
          </h1>
          <p className="text-sm leading-6 text-slate-600">
            The definitive hub for performance-boosting material. Distribute training guides, nutrition
            resources, and video tutorials to your clients in one centralized library.
          </p>
        </div>
        <a
          href="/education/add"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4" />
          Create New Resource
        </a>
      </header>

      <nav aria-label="Education resource filters" className="flex flex-wrap gap-3">
        {educationTabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`rounded-full border px-5 py-2.5 text-sm font-bold transition ${
              activeTab === tab
                ? "border-orange-500 bg-orange-500 text-white"
                : "border-slate-200 bg-white text-slate-700 hover:border-orange-300"
            }`}
          >
            {tab}
          </button>
        ))}
      </nav>

      <section className="grid gap-6 xl:grid-cols-3">
        <article className="relative min-h-96 overflow-hidden rounded-3xl bg-slate-950 p-8 text-white xl:col-span-2">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(99,102,241,0.75),transparent_35%),linear-gradient(135deg,rgba(15,23,42,0.2),rgba(88,28,135,0.8))]" />
          <div className="relative flex h-full max-w-3xl flex-col justify-end">
            <span className="mb-4 w-fit rounded-full bg-purple-600 px-3 py-1 text-xs font-bold uppercase tracking-wide">
              {featuredEducationResource.label}
            </span>
            <h2 className="mb-3 text-3xl font-black">{featuredEducationResource.title}</h2>
            <p className="mb-6 max-w-2xl text-sm leading-6 text-white/75">{featuredEducationResource.summary}</p>
            <div className="flex flex-wrap gap-3">
              <button className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-slate-100">
                <Play className="h-4 w-4" />
                Watch Video
              </button>
              <button className="rounded-xl bg-white/15 px-5 py-3 text-sm font-bold text-white backdrop-blur transition hover:bg-white/25">
                Assign to Client
              </button>
            </div>
          </div>
        </article>

        <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-black">Macro Tracking for Performance</h2>
          <p className="mb-6 text-sm leading-6 text-slate-600">
            A step-by-step guide for how to measure nutrition success for athletes.
          </p>
          <button className="inline-flex items-center gap-1 text-sm font-bold text-indigo-600 hover:text-indigo-700">
            Assign Now
            <ChevronRight className="h-4 w-4" />
          </button>
        </aside>
      </section>

      <section aria-labelledby="latest-resources-heading">
        <div className="mb-6 flex items-center justify-between">
          <h2 id="latest-resources-heading" className="text-xl font-black">
            Latest Resources
          </h2>
          <button className="text-sm font-bold text-indigo-600 hover:text-indigo-700">View archive -&gt;</button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {educationResources.map((resource) => (
            <article
              key={resource.id}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:border-indigo-300 hover:shadow-lg"
            >
              <div className={`relative h-32 bg-gradient-to-br ${resource.gradient}`}>
                <span className="absolute right-3 top-3 rounded bg-white/90 px-2 py-1 text-xs font-bold text-slate-900">
                  {resource.type}
                </span>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-slate-950">{resource.title}</h3>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-500">{resource.category}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
