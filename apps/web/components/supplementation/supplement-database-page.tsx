"use client";

import { Plus, Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { supplementEntries, type SupplementEntry } from "@/fixtures/supplementation";

const categoryOptions = ["Morning", "Evening", "Anytime"] as const;
const timingOptions = ["Morning", "Mid-day", "Evening", "Anytime"] as const;

interface ApiSupplement {
  id: string;
  name: string;
  category: string;
  recommendedTiming: string | null;
  dosage: string | null;
  bioavailabilityNotes: string | null;
  clinicalDescription: string | null;
}

export function SupplementDatabasePage() {
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [supplements, setSupplements] = useState<SupplementEntry[]>(supplementEntries);
  const [librarySource, setLibrarySource] = useState<"fixture" | "api">("fixture");
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState("");
  const [newSupplement, setNewSupplement] = useState({
    name: "",
    category: "",
    timing: "",
    dosage: ""
  });

  useEffect(() => {
    let mounted = true;

    async function loadSupplements() {
      try {
        const response = await fetch("/api/v1/supplements?limit=100");

        if (!response.ok) {
          return;
        }

        const payload = (await response.json()) as { data?: ApiSupplement[] };
        const apiSupplements = Array.isArray(payload.data) ? payload.data : [];

        if (mounted && apiSupplements.length > 0) {
          setSupplements(apiSupplements.map(mapApiSupplementToEntry));
          setLibrarySource("api");
        }
      } catch {
        if (mounted) {
          setLibrarySource("fixture");
        }
      }
    }

    void loadSupplements();

    return () => {
      mounted = false;
    };
  }, []);

  const filteredSupplements = supplements.filter((supplement) => {
    const query = searchQuery.toLowerCase();
    return supplement.name.toLowerCase().includes(query) || supplement.category.toLowerCase().includes(query);
  });

  async function createSupplement() {
    if (!newSupplement.name.trim()) {
      return;
    }

    setIsSaving(true);
    setStatus("Creating supplement...");

    try {
      const response = await fetch("/api/v1/supplements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newSupplement.name.trim(),
          category: newSupplement.category || "Custom",
          recommendedTiming: newSupplement.timing || "As needed",
          dosage: newSupplement.dosage || "Variable",
          clinicalDescription: "Coach-created supplement library entry."
        })
      });

      if (!response.ok) {
        throw new Error("Supplement creation failed.");
      }

      const payload = (await response.json()) as { data: ApiSupplement };
      setSupplements((current) => [mapApiSupplementToEntry(payload.data), ...current]);
      setLibrarySource("api");
      setNewSupplement({ name: "", category: "", timing: "", dosage: "" });
      setShowAddPanel(false);
      setStatus("Supplement created.");
    } catch {
      setStatus("Could not create this supplement.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="space-y-8 p-6 lg:p-8">
      <header>
        <div className="mb-2 flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-black">Supplementation Library</h1>
          <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-black uppercase tracking-wide text-purple-700">
            Master Compendium
          </span>
        </div>
        <p className="max-w-3xl text-sm leading-6 text-slate-600">
          Manage your entire protocol for performance and recovery. Curate precise methodology for
          data-optimized client results.
        </p>
      </header>

      <section className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="text-sm font-bold uppercase tracking-wide text-slate-500">Total Entries</div>
          <div className="mt-2 text-4xl font-black text-indigo-600">{supplements.length}</div>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="text-sm font-bold uppercase tracking-wide text-slate-500">Library Source</div>
          <div className="mt-2 text-4xl font-black text-purple-600">{librarySource === "api" ? "API" : "Demo"}</div>
        </article>
      </section>

      <section className="flex flex-col gap-4 lg:flex-row">
        <label className="relative flex-1">
          <span className="sr-only">Search supplements or protocols</span>
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search supplements or protocols..."
            className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </label>
        <button
          type="button"
          onClick={() => setShowAddPanel(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4" />
          New Entry
        </button>
      </section>

      <section aria-labelledby="supplements-heading">
        <div className="mb-4 flex items-center justify-between">
          <h2 id="supplements-heading" className="text-lg font-black">
            Supplements & Nutrients
          </h2>
          {status ? <p role="status" className="text-sm font-bold text-indigo-600">{status}</p> : null}
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          {filteredSupplements.map((supplement) => (
            <article key={supplement.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-indigo-300 hover:shadow-lg">
              <div className="mb-4 flex items-center gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-slate-900 to-indigo-700 text-lg font-black text-white">
                  {supplement.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <h3 className="truncate font-black">{supplement.name}</h3>
                  <p className="text-xs text-slate-500">{supplement.dosage}</p>
                </div>
              </div>
              <dl className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <dt className="text-slate-500">Category</dt>
                  <dd className="font-bold">{supplement.category}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-slate-500">Timing</dt>
                  <dd className="font-bold">{supplement.timing}</dd>
                </div>
              </dl>
              <div className="mt-4 rounded-xl bg-indigo-50 p-3 text-xs leading-5 text-indigo-800">
                <span className="font-black">Coach note:</span> {supplement.coachNote}
              </div>
            </article>
          ))}
        </div>
      </section>

      {showAddPanel ? (
        <>
          <button
            type="button"
            aria-label="Close new protocol backdrop"
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
            onClick={() => setShowAddPanel(false)}
          />
          <aside
            role="dialog"
            aria-modal="true"
            aria-label="New Protocol"
            className="fixed right-0 top-0 z-50 h-full w-full max-w-lg overflow-hidden bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
              <div>
                <h2 className="text-2xl font-black">New Protocol</h2>
                <p className="text-sm text-indigo-100">Add supplement to library</p>
              </div>
              <button
                type="button"
                aria-label="Close new protocol panel"
                onClick={() => setShowAddPanel(false)}
                className="rounded-xl p-2 transition hover:bg-white/20"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="h-[calc(100%-180px)] space-y-6 overflow-y-auto p-6">
              <label className="block text-sm font-bold text-slate-700">
                Supplement Name
                <input
                  value={newSupplement.name}
                  onChange={(event) => setNewSupplement({ ...newSupplement, name: event.target.value })}
                  placeholder="e.g., Vitamin D3"
                  className="mt-2 w-full rounded-xl border border-slate-300 p-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </label>

              <div>
                <div className="mb-2 text-sm font-bold text-slate-700">Supplement Category</div>
                <div className="grid grid-cols-3 gap-3">
                  {categoryOptions.map((category) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => setNewSupplement({ ...newSupplement, category })}
                      className={`rounded-xl border-2 p-3 text-sm font-bold transition ${
                        newSupplement.category === category
                          ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                          : "border-slate-200 text-slate-700 hover:border-slate-300"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="mb-2 text-sm font-bold text-slate-700">Optimal Timing</div>
                <div className="grid grid-cols-2 gap-3">
                  {timingOptions.map((timing) => (
                    <button
                      key={timing}
                      type="button"
                      aria-label={`Timing ${timing}`}
                      onClick={() => setNewSupplement({ ...newSupplement, timing: `Once ${timing.toLowerCase()}` })}
                      className={`rounded-xl border-2 p-3 text-sm font-bold transition ${
                        newSupplement.timing === `Once ${timing.toLowerCase()}`
                          ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                          : "border-slate-200 text-slate-700 hover:border-slate-300"
                      }`}
                    >
                      {timing}
                    </button>
                  ))}
                </div>
              </div>

              <label className="block text-sm font-bold text-slate-700">
                Standard Dosage
                <input
                  value={newSupplement.dosage}
                  onChange={(event) => setNewSupplement({ ...newSupplement, dosage: event.target.value })}
                  placeholder="e.g., 5000 IU"
                  className="mt-2 w-full rounded-xl border border-slate-300 p-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </label>
            </div>

            <div className="absolute bottom-0 left-0 right-0 flex gap-3 border-t border-slate-200 bg-slate-50 p-6">
              <button
                type="button"
                onClick={() => setShowAddPanel(false)}
                className="flex-1 rounded-xl border border-slate-300 px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
              >
                Save as Draft
              </button>
              <button
                type="button"
                disabled={!newSupplement.name.trim()}
                onClick={createSupplement}
                className="flex-1 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSaving ? "Creating..." : "Create Protocol"}
              </button>
            </div>
          </aside>
        </>
      ) : null}
    </main>
  );
}

function mapApiSupplementToEntry(supplement: ApiSupplement): SupplementEntry {
  return {
    id: supplement.id,
    name: supplement.name,
    category: supplement.category,
    timing: supplement.recommendedTiming ?? "As needed",
    dosage: supplement.dosage ?? "Variable",
    coachNote:
      supplement.bioavailabilityNotes ??
      supplement.clinicalDescription ??
      "Review client tolerance before assigning broadly."
  };
}
