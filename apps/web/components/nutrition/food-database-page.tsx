"use client";

import { ChevronLeft, ChevronRight, Database, Download, Plus, Search } from "lucide-react";
import { useState } from "react";

import { foodCategories, foods } from "@/fixtures/nutrition";
import { cn } from "@/lib/utils";

export function FoodDatabasePage() {
  const [selectedCategory, setSelectedCategory] = useState("All Ingredients");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredFoods = foods
    .filter((food) => selectedCategory === "All Ingredients" || food.category === selectedCategory)
    .filter(
      (food) =>
        food.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        food.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <div className="mb-2 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="mb-2 text-3xl font-bold">Food Database</h1>
            <p className="text-gray-600">Curate your custom ingredients or import from verified global libraries.</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 rounded-lg border border-indigo-600 bg-white px-5 py-2.5 text-indigo-600 transition-colors hover:bg-indigo-50">
              <Download className="size-4" aria-hidden="true" />
              Import
            </button>
            <button className="flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-white transition-colors hover:bg-indigo-700">
              <Plus className="size-4" aria-hidden="true" />
              Create New Food
            </button>
          </div>
        </div>
      </div>

      <div className="relative mb-6">
        <label htmlFor="food-search" className="sr-only">
          Search foods
        </label>
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" aria-hidden="true" />
        <input
          id="food-search"
          type="search"
          value={searchQuery}
          placeholder="Search thousands of ingredients..."
          className="w-full rounded-lg border border-gray-200 py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          onChange={(event) => setSearchQuery(event.target.value)}
        />
      </div>

      <div className="mb-8 flex flex-wrap items-center gap-3">
        {foodCategories.map((category) => (
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

      <section className="mb-8 flex items-center justify-between rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 p-6">
        <div className="flex-1 text-white">
          <h2 className="mb-2 text-xl font-bold">Unlock Global Food Database</h2>
          <p className="mb-4 text-sm text-indigo-100">
            Access 50,000+ verified ingredients with complete macro breakdowns and international serving sizes
          </p>
          <button className="rounded-lg bg-white px-5 py-2 text-sm font-medium text-indigo-700 transition-colors hover:bg-indigo-50">
            Sync Now
          </button>
        </div>
        <div className="flex size-24 items-center justify-center rounded-full bg-white/10">
          <Database className="size-12 text-white" aria-hidden="true" />
        </div>
      </section>

      <div className="mb-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Recent Ingredients</h2>
          <span className="text-sm text-gray-500">Showing {filteredFoods.length} results</span>
        </div>

        <section aria-label="Food grid" className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {filteredFoods.map((food) => (
            <article key={food.id} className="group rounded-xl border border-gray-200 bg-white p-5 transition-all hover:border-indigo-300 hover:shadow-lg">
              <div className="relative mb-4">
                <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-gray-100 text-xl font-bold text-gray-500">
                  {food.name[0]}
                </div>
                <button
                  aria-label={`Add ${food.name}`}
                  className="absolute right-0 top-0 flex size-8 items-center justify-center rounded-full border border-gray-200 bg-white opacity-0 transition-colors hover:border-indigo-300 hover:bg-indigo-50 group-hover:opacity-100"
                >
                  <Plus className="size-4 text-indigo-600" aria-hidden="true" />
                </button>
              </div>
              <div className="mb-4 text-center">
                <h3 className="mb-1 font-semibold text-gray-900">{food.name}</h3>
                <p className="text-xs text-gray-500">{food.serving}</p>
              </div>
              <div className="space-y-2">
                <FoodMacro label="Calories" value={`${food.calories}`} tone="text-gray-900" />
                <FoodMacro label="Protein" value={`${food.protein}g`} tone="text-blue-600" />
                <FoodMacro label="Carbs" value={`${food.carbs}g`} tone="text-green-600" />
                <FoodMacro label="Fats" value={`${food.fats}g`} tone="text-orange-600" />
              </div>
            </article>
          ))}

          <article className="flex min-h-72 flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-5 transition-all hover:border-indigo-400 hover:bg-indigo-50">
            <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-white">
              <Plus className="size-6 text-gray-400" aria-hidden="true" />
            </div>
            <h3 className="font-semibold text-gray-700">Add New Ingredient</h3>
          </article>
        </section>
      </div>

      <div className="mt-8 flex items-center justify-center gap-2">
        <button
          type="button"
          aria-label="Previous food page"
          disabled={currentPage === 1}
          className="flex size-8 items-center justify-center rounded border border-gray-200 transition-colors hover:bg-gray-50 disabled:opacity-50"
          onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
        </button>
        {[1, 2, 3, 12].map((page) => (
          <button
            key={page}
            type="button"
            className={cn(
              "flex size-8 items-center justify-center rounded border text-sm font-medium",
              currentPage === page
                ? "border-indigo-600 bg-indigo-600 text-white"
                : "border-gray-200 transition-colors hover:bg-gray-50"
            )}
            onClick={() => setCurrentPage(page)}
          >
            {page}
          </button>
        ))}
        <button
          type="button"
          aria-label="Next food page"
          className="flex size-8 items-center justify-center rounded border border-gray-200 transition-colors hover:bg-gray-50"
          onClick={() => setCurrentPage((page) => page + 1)}
        >
          <ChevronRight className="size-4" aria-hidden="true" />
        </button>
      </div>
      <p role="status" aria-label="Food database page" className="sr-only">
        Page {currentPage}
      </p>
    </div>
  );
}

function FoodMacro({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-gray-500">{label}</span>
      <span className={cn("font-semibold", tone)}>{value}</span>
    </div>
  );
}
