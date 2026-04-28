"use client";

import Link from "next/link";
import { ChevronDown, Filter, Play, Plus, Search, Star, Target } from "lucide-react";
import { useState } from "react";

import { exerciseCategories, exercises } from "@/fixtures/training";
import { cn } from "@/lib/utils";

export function ExerciseDatabasePage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredExercises = exercises
    .filter((exercise) => selectedCategory === "All" || exercise.category === selectedCategory)
    .filter(
      (exercise) =>
        exercise.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exercise.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <div className="mb-4 flex flex-col justify-between gap-4 md:flex-row md:items-start">
          <div>
            <h1 className="mb-2 text-3xl font-bold">The Movement Vault</h1>
            <p className="max-w-3xl text-gray-600">
              A curated collection of biomechanically optimized demonstrations. Filter by anatomical target or equipment consistency to build safe programming.
            </p>
          </div>
          <Link
            href="/training/exercises/add"
            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-white transition-colors hover:bg-indigo-700"
          >
            <Plus className="size-4" aria-hidden="true" />
            Add Exercise
          </Link>
        </div>
      </div>

      <div className="mb-8 flex flex-wrap items-center gap-3">
        {exerciseCategories.map((category) => (
          <button
            key={category}
            type="button"
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium transition-all",
              selectedCategory === category
                ? "bg-orange-500 text-white"
                : "border border-gray-200 bg-white text-gray-700 hover:border-orange-300"
            )}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="mb-8 flex flex-col gap-4 xl:flex-row xl:items-center">
        <div className="relative flex-1">
          <label htmlFor="exercise-search" className="sr-only">
            Search exercises
          </label>
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" aria-hidden="true" />
          <input
            id="exercise-search"
            type="search"
            value={searchQuery}
            placeholder="Search exercises..."
            className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            onChange={(event) => setSearchQuery(event.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <ActionButton icon={Target} label="Muscle" />
          <ActionButton icon={Filter} label="Favorites" />
          <ActionButton icon={Play} label="Exercises" />
          <ActionButton icon={Filter} label="Latest" />
        </div>
      </div>

      <section aria-label="Exercise grid" className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {filteredExercises.map((exercise) => (
          <article key={exercise.id} className="group overflow-hidden rounded-xl border border-gray-200 bg-white transition-all hover:border-indigo-300 hover:shadow-lg">
            <div className="relative flex h-48 items-center justify-center overflow-hidden bg-gradient-to-br from-gray-950 to-indigo-950">
              <div className="absolute right-3 top-3 flex items-center gap-1 rounded bg-black/50 px-2 py-1 text-white backdrop-blur-sm">
                <Play className="size-3" aria-hidden="true" />
                <span className="text-xs">{exercise.videos}</span>
              </div>
            </div>
            <div className="p-4">
              <div className="mb-2 flex items-start justify-between">
                <h2 className="flex-1 font-semibold text-gray-900">{exercise.name}</h2>
                <button aria-label={`Favorite ${exercise.name}`} className="rounded p-1 transition-colors hover:bg-yellow-50">
                  <Star className="size-4 fill-yellow-500 text-yellow-500" aria-hidden="true" />
                </button>
              </div>
              <div className="mb-3 flex items-center gap-2">
                <span className="rounded bg-indigo-100 px-2 py-1 text-xs text-indigo-700">{exercise.category}</span>
                <span className="flex items-center gap-1">
                  <Star className="size-3 fill-yellow-500 text-yellow-500" aria-hidden="true" />
                  <span className="text-xs text-gray-600">{exercise.rating}</span>
                </span>
              </div>
              <p className="text-xs text-gray-500">{exercise.variations} variations available</p>
            </div>
          </article>
        ))}
      </section>

      <div className="mt-8 text-center">
        <button className="mx-auto flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700">
          Explore More Movements
          <ChevronDown className="size-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

function ActionButton({ icon: Icon, label }: { icon: typeof Target; label: string }) {
  return (
    <button className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm transition-colors hover:bg-gray-50">
      <Icon className="size-4" aria-hidden="true" />
      {label}
    </button>
  );
}
