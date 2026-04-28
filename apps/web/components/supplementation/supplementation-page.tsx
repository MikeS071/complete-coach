import { Filter, Package, Plus, Search, ShoppingCart, TrendingUp, Users } from "lucide-react";
import { inventoryItems, supplementProtocols } from "@/fixtures/supplementation";

const statCards = [
  { label: "Active Protocols", value: "79", icon: Package, tone: "purple" },
  { label: "Avg. Adherence", value: "86%", icon: TrendingUp, tone: "green" },
  { label: "Athletes Enrolled", value: "79", icon: Users, tone: "indigo" },
  { label: "Items Low Stock", value: "4", icon: ShoppingCart, tone: "orange" }
] as const;

const toneClasses = {
  purple: "bg-purple-50 text-purple-600",
  green: "bg-green-50 text-green-600",
  indigo: "bg-indigo-50 text-indigo-600",
  orange: "bg-orange-50 text-orange-600"
};

export function SupplementationPage() {
  return (
    <main className="space-y-8 p-6 lg:p-8">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-black">Supplementation</h1>
          <p className="text-sm text-slate-600">Manage supplement protocols and track athlete compliance</p>
        </div>
        <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-indigo-700">
          <Plus className="h-4 w-4" />
          Create Protocol
        </button>
      </header>

      <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <article key={card.label} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${toneClasses[card.tone]}`}>
                <Icon className="h-6 w-6" />
              </div>
              <div className="text-3xl font-black">{card.value}</div>
              <div className="text-sm text-slate-600">{card.label}</div>
            </article>
          );
        })}
      </section>

      <section className="flex flex-col gap-4 lg:flex-row">
        <label className="relative flex-1">
          <span className="sr-only">Search protocols</span>
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            placeholder="Search protocols..."
            className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </label>
        <button className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold transition hover:bg-slate-50">
          <Filter className="h-4 w-4" />
          Filters
        </button>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        {supplementProtocols.map((protocol) => (
          <article key={protocol.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-lg">
            <div className="relative h-40 bg-gradient-to-br from-purple-500 to-pink-600">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_30%,rgba(255,255,255,0.45),transparent_20%),radial-gradient(circle_at_70%_65%,rgba(255,255,255,0.25),transparent_24%)]" />
              <span className="absolute left-4 top-4 rounded-full bg-white/20 px-3 py-1 text-sm font-bold text-white backdrop-blur">
                {protocol.category}
              </span>
              <span className="absolute right-4 top-4 rounded-full bg-white/20 px-3 py-1 text-sm font-bold text-white backdrop-blur">
                {protocol.clients} athletes
              </span>
            </div>
            <div className="p-6">
              <h2 className="mb-3 text-lg font-black">{protocol.name}</h2>
              <div className="mb-4 rounded-xl bg-slate-50 p-4">
                <div className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">Supplements</div>
                <div className="flex flex-wrap gap-2">
                  {protocol.supplements.map((supplement) => (
                    <span key={supplement} className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-semibold">
                      {supplement}
                    </span>
                  ))}
                </div>
              </div>
              <div className="mb-4">
                <div className="mb-2 flex justify-between text-sm">
                  <span className="text-slate-600">Adherence Rate</span>
                  <span className="font-bold text-green-600">{protocol.adherence}%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100">
                  <div className="h-2 rounded-full bg-green-600" style={{ width: `${protocol.adherence}%` }} />
                </div>
              </div>
              <div className="flex gap-2">
                <button className="flex-1 rounded-xl bg-indigo-600 py-2.5 text-sm font-bold text-white transition hover:bg-indigo-700">
                  Manage Protocol
                </button>
                <button className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold transition hover:bg-slate-50">
                  Edit
                </button>
              </div>
            </div>
          </article>
        ))}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-black">Inventory Status</h2>
          <button className="text-sm font-bold text-indigo-600 hover:text-indigo-700">View Full Inventory</button>
        </div>
        <div className="divide-y divide-slate-100">
          {inventoryItems.map((item) => (
            <div key={item.name} className="flex flex-col gap-4 py-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                  <Package className="h-6 w-6" />
                </div>
                <div>
                  <div className="font-bold">{item.name}</div>
                  <div className="text-sm text-slate-500">
                    Reorder at {item.reorder} {item.unit}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <div className="text-lg font-black">{item.stock}</div>
                  <div className="text-xs text-slate-500">{item.unit} in stock</div>
                </div>
                {item.stock < item.reorder ? (
                  <button className="rounded-xl bg-orange-100 px-4 py-2 text-sm font-bold text-orange-700">Reorder Now</button>
                ) : (
                  <span className="rounded-xl bg-green-100 px-4 py-2 text-sm font-bold text-green-700">In Stock</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
