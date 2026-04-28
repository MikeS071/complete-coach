import { Copy, DollarSign, Edit, Package, Star, Trash2, TrendingUp, Users } from "lucide-react";
import { packages } from "@/fixtures/operations";

const colorClasses = {
  indigo: "border-indigo-200 bg-indigo-50 text-indigo-700",
  yellow: "border-yellow-200 bg-yellow-50 text-yellow-700",
  gray: "border-slate-200 bg-slate-50 text-slate-700",
  purple: "border-purple-200 bg-purple-50 text-purple-700"
};

export function PackagesPage() {
  const totalRevenue = packages.reduce((sum, coachingPackage) => sum + coachingPackage.revenue, 0);
  const totalClients = packages.reduce((sum, coachingPackage) => sum + coachingPackage.activeClients, 0);
  const monthlyPackages = packages.filter((coachingPackage) => coachingPackage.billing === "monthly");
  const averageMonthlyPrice = Math.round(
    monthlyPackages.reduce((sum, coachingPackage) => sum + coachingPackage.price, 0) / monthlyPackages.length
  );
  const stats = [
    { label: "Total Packages", value: packages.length, icon: Package },
    { label: "Monthly Revenue", value: `$${totalRevenue.toLocaleString()}`, icon: DollarSign },
    { label: "Active Clients", value: totalClients, icon: Users },
    { label: "Avg. Package Price", value: `$${averageMonthlyPrice}`, icon: TrendingUp }
  ];

  return (
    <main className="space-y-8 p-6 lg:p-8">
      <header>
        <h1 className="mb-2 text-3xl font-black">Packages & Pricing</h1>
        <p className="text-sm text-slate-600">Manage your coaching packages and track revenue performance.</p>
      </header>

      <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
          <article key={stat.label} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-2 flex items-center justify-between text-xs font-bold uppercase tracking-wide text-slate-500">
              <span>{stat.label}</span>
              <Icon className="h-4 w-4" />
            </div>
            <div className="text-3xl font-black">{stat.value}</div>
          </article>
          );
        })}
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-black">All Packages</h2>
          <button className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-indigo-700">
            <Package className="h-4 w-4" />
            Create Package
          </button>
        </div>
        <div className="grid gap-6 xl:grid-cols-2">
          {packages.map((coachingPackage) => (
            <article
              key={coachingPackage.id}
              className={`rounded-2xl border-2 p-6 shadow-sm ${colorClasses[coachingPackage.color as keyof typeof colorClasses]}`}
            >
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <h3 className="mb-1 text-xl font-black">{coachingPackage.name}</h3>
                  <p className="text-sm opacity-80">{coachingPackage.description}</p>
                </div>
                <div className="flex gap-2">
                  <button aria-label={`Edit ${coachingPackage.name}`} className="rounded-lg p-2 transition hover:bg-white/50">
                    <Edit className="h-4 w-4" />
                  </button>
                  <button aria-label={`Duplicate ${coachingPackage.name}`} className="rounded-lg p-2 transition hover:bg-white/50">
                    <Copy className="h-4 w-4" />
                  </button>
                  <button aria-label={`Delete ${coachingPackage.name}`} className="rounded-lg p-2 transition hover:bg-white/50">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="mb-4 text-4xl font-black">
                ${coachingPackage.price}
                <span className="text-lg font-normal opacity-70">/{coachingPackage.billing === "monthly" ? "mo" : "once"}</span>
              </div>
              <div className="mb-4">
                <h4 className="mb-2 text-xs font-black uppercase tracking-wide opacity-70">Features</h4>
                <ul className="space-y-1.5">
                  {coachingPackage.features.map((feature) => (
                    <li key={feature} className="flex gap-2 text-sm">
                      <Star className="mt-0.5 h-3 w-3 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="grid grid-cols-2 gap-4 border-t border-current/20 pt-4">
                <div>
                  <div className="text-xs opacity-70">Active Clients</div>
                  <div className="text-2xl font-black">{coachingPackage.activeClients}</div>
                </div>
                <div>
                  <div className="text-xs opacity-70">Revenue</div>
                  <div className="text-2xl font-black">${coachingPackage.revenue.toLocaleString()}</div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
