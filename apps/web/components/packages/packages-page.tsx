"use client";

import { Copy, DollarSign, Edit, Package, Star, Trash2, TrendingUp, Users } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { packages as fixturePackages } from "@/fixtures/operations";
import { cn } from "@/lib/utils";

type BillingInterval = "monthly" | "one-time";

interface ApiPackage {
  id: string;
  name: string;
  description: string | null;
  priceAmount: number;
  currency: string;
  billingInterval: BillingInterval;
  stripeProductId: string | null;
  stripePriceId: string | null;
  status: "active" | "archived";
  features: string[];
  color: string | null;
  activeSubscriptions: number;
  projectedMonthlyRevenue: number;
}

interface PackageFormState {
  name: string;
  description: string;
  price: string;
  billingInterval: BillingInterval;
  features: string;
  color: string;
}

const defaultFormState: PackageFormState = {
  name: "",
  description: "",
  price: "",
  billingInterval: "monthly",
  features: "",
  color: "indigo"
};

const colorClasses = {
  indigo: "border-indigo-200 bg-indigo-50 text-indigo-700",
  yellow: "border-yellow-200 bg-yellow-50 text-yellow-700",
  gray: "border-slate-200 bg-slate-50 text-slate-700",
  purple: "border-purple-200 bg-purple-50 text-purple-700"
};

export function PackagesPage() {
  const [packages, setPackages] = useState<ApiPackage[]>(() => fixturePackages.map(mapFixturePackage));
  const [source, setSource] = useState<"api" | "fixture">("fixture");
  const [formOpen, setFormOpen] = useState(false);
  const [editingPackageId, setEditingPackageId] = useState<string | null>(null);
  const [formState, setFormState] = useState<PackageFormState>(defaultFormState);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    async function loadPackages() {
      const loadedPackages = await fetchPackages();

      if (!isActive) {
        return;
      }

      if (loadedPackages) {
        setSource("api");
        setPackages(loadedPackages);
      } else {
        setSource("fixture");
        setPackages(fixturePackages.map(mapFixturePackage));
      }
    }

    void loadPackages();

    return () => {
      isActive = false;
    };
  }, []);

  const stats = useMemo(() => buildPackageStats(packages), [packages]);
  const editingPackage = editingPackageId ? packages.find((coachingPackage) => coachingPackage.id === editingPackageId) : null;

  function openCreateForm() {
    setEditingPackageId(null);
    setFormState(defaultFormState);
    setFormError(null);
    setFormOpen(true);
  }

  function openEditForm(coachingPackage: ApiPackage) {
    setEditingPackageId(coachingPackage.id);
    setFormState(packageToFormState(coachingPackage));
    setFormError(null);
    setFormOpen(true);
  }

  function openDuplicateForm(coachingPackage: ApiPackage) {
    setEditingPackageId(null);
    setFormState({
      ...packageToFormState(coachingPackage),
      name: `${coachingPackage.name} Copy`
    });
    setFormError(null);
    setFormOpen(true);
  }

  async function handleSavePackage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const payload = formStateToPayload(formState);

    if (!payload) {
      setFormError("Enter a package name and a valid price.");
      return;
    }

    if (source !== "api") {
      upsertLocalPackage(payload);
      setFormOpen(false);
      return;
    }

    try {
      const response = await fetch(editingPackageId ? `/api/v1/packages/${editingPackageId}` : "/api/v1/packages", {
        method: editingPackageId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error("Package persistence API unavailable.");
      }

      const responsePayload = (await response.json()) as { data: ApiPackage };
      setPackages((currentPackages) =>
        editingPackageId
          ? currentPackages.map((coachingPackage) =>
              coachingPackage.id === responsePayload.data.id ? responsePayload.data : coachingPackage
            )
          : [...currentPackages, responsePayload.data]
      );
      setFormOpen(false);
    } catch {
      setFormError("Package could not be saved. Try again.");
    }
  }

  async function handleArchivePackage(coachingPackage: ApiPackage) {
    if (source !== "api") {
      setPackages((currentPackages) => currentPackages.filter((currentPackage) => currentPackage.id !== coachingPackage.id));
      return;
    }

    try {
      const response = await fetch(`/api/v1/packages/${coachingPackage.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "archived" })
      });

      if (!response.ok) {
        throw new Error("Package archive API unavailable.");
      }

      setPackages((currentPackages) => currentPackages.filter((currentPackage) => currentPackage.id !== coachingPackage.id));
    } catch {
      setFormError("Package could not be archived. Try again.");
    }
  }

  async function handleStripeSync(coachingPackage: ApiPackage) {
    if (source !== "api") {
      return;
    }

    try {
      const response = await fetch(`/api/v1/packages/${coachingPackage.id}/stripe-sync`, { method: "POST" });

      if (!response.ok) {
        throw new Error("Stripe sync API unavailable.");
      }

      const responsePayload = (await response.json()) as { data: ApiPackage };
      setPackages((currentPackages) =>
        currentPackages.map((currentPackage) =>
          currentPackage.id === responsePayload.data.id ? responsePayload.data : currentPackage
        )
      );
    } catch {
      setFormError("Stripe sync could not be started. Check Connect setup and try again.");
    }
  }

  function upsertLocalPackage(payload: NonNullable<ReturnType<typeof formStateToPayload>>) {
    const nextPackage: ApiPackage = {
      id: editingPackageId ?? `local-package-${Date.now()}`,
      name: payload.name,
      description: payload.description ?? null,
      priceAmount: payload.priceAmount,
      currency: payload.currency,
      billingInterval: payload.billingInterval,
      stripeProductId: null,
      stripePriceId: null,
      status: "active",
      features: payload.features,
      color: payload.color ?? "indigo",
      activeSubscriptions: editingPackage?.activeSubscriptions ?? 0,
      projectedMonthlyRevenue:
        payload.billingInterval === "monthly" ? payload.priceAmount * (editingPackage?.activeSubscriptions ?? 0) : 0
    };

    setPackages((currentPackages) =>
      editingPackageId
        ? currentPackages.map((coachingPackage) =>
            coachingPackage.id === editingPackageId ? nextPackage : coachingPackage
          )
        : [...currentPackages, nextPackage]
    );
  }

  return (
    <main className="space-y-8 p-6 lg:p-8">
      <header>
        <h1 className="mb-2 text-3xl font-black">Packages & Pricing</h1>
        <p className="text-sm text-slate-600">Manage your coaching packages and track revenue performance.</p>
      </header>

      <section aria-label="Package revenue summary" className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
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
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-indigo-700"
            onClick={openCreateForm}
          >
            <Package className="h-4 w-4" />
            Create Package
          </button>
        </div>
        <div className="grid gap-6 xl:grid-cols-2">
          {packages.map((coachingPackage) => (
            <PackageCard
              key={coachingPackage.id}
              coachingPackage={coachingPackage}
              onArchive={handleArchivePackage}
              onDuplicate={openDuplicateForm}
              onEdit={openEditForm}
              onStripeSync={handleStripeSync}
            />
          ))}
        </div>
      </section>

      <PackageDialog
        error={formError}
        formState={formState}
        mode={editingPackageId ? "edit" : "create"}
        open={formOpen}
        onOpenChange={setFormOpen}
        onSave={handleSavePackage}
        onUpdateForm={setFormState}
      />
    </main>
  );
}

function PackageCard({
  coachingPackage,
  onArchive,
  onDuplicate,
  onEdit,
  onStripeSync
}: {
  coachingPackage: ApiPackage;
  onArchive: (coachingPackage: ApiPackage) => void;
  onDuplicate: (coachingPackage: ApiPackage) => void;
  onEdit: (coachingPackage: ApiPackage) => void;
  onStripeSync: (coachingPackage: ApiPackage) => void;
}) {
  const colorClass = colorClasses[(coachingPackage.color ?? "gray") as keyof typeof colorClasses] ?? colorClasses.gray;
  const isStripeSynced = Boolean(coachingPackage.stripeProductId && coachingPackage.stripePriceId);

  return (
    <article className={cn("rounded-2xl border-2 p-6 shadow-sm", colorClass)}>
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <h3 className="text-xl font-black">{coachingPackage.name}</h3>
            <span className="rounded-full border border-current/20 px-2 py-1 text-xs font-bold">
              {isStripeSynced ? "Synced" : "Needs sync"}
            </span>
          </div>
          <p className="text-sm opacity-80">{coachingPackage.description}</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            aria-label={`Edit ${coachingPackage.name}`}
            className="rounded-lg p-2 transition hover:bg-white/50"
            onClick={() => onEdit(coachingPackage)}
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label={`Duplicate ${coachingPackage.name}`}
            className="rounded-lg p-2 transition hover:bg-white/50"
            onClick={() => onDuplicate(coachingPackage)}
          >
            <Copy className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label={`Archive ${coachingPackage.name}`}
            className="rounded-lg p-2 transition hover:bg-white/50"
            onClick={() => onArchive(coachingPackage)}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="mb-4 text-4xl font-black">
        {formatCents(coachingPackage.priceAmount)}
        <span className="text-lg font-normal opacity-70">
          /{coachingPackage.billingInterval === "monthly" ? "mo" : "once"}
        </span>
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
          <div className="text-2xl font-black">{coachingPackage.activeSubscriptions}</div>
        </div>
        <div>
          <div className="text-xs opacity-70">Revenue</div>
          <div className="text-2xl font-black">{formatCents(coachingPackage.projectedMonthlyRevenue)}</div>
        </div>
      </div>
      {!isStripeSynced ? (
        <button
          type="button"
          className="mt-5 rounded-lg border border-current/30 px-3 py-2 text-sm font-bold transition hover:bg-white/50"
          onClick={() => onStripeSync(coachingPackage)}
        >
          Sync Stripe
        </button>
      ) : null}
    </article>
  );
}

function PackageDialog({
  error,
  formState,
  mode,
  open,
  onOpenChange,
  onSave,
  onUpdateForm
}: {
  error: string | null;
  formState: PackageFormState;
  mode: "create" | "edit";
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (event: FormEvent<HTMLFormElement>) => void;
  onUpdateForm: (formState: PackageFormState) => void;
}) {
  const title = mode === "create" ? "Create Package" : "Edit Package";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>Package details are saved to the active organization.</DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={onSave}>
          <label className="block text-sm font-bold text-slate-700">
            Package Name
            <Input
              value={formState.name}
              className="mt-1"
              onChange={(event) => onUpdateForm({ ...formState, name: event.target.value })}
            />
          </label>
          <label className="block text-sm font-bold text-slate-700">
            Description
            <textarea
              value={formState.description}
              className="mt-1 min-h-20 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              onChange={(event) => onUpdateForm({ ...formState, description: event.target.value })}
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-bold text-slate-700">
              Price
              <Input
                type="number"
                min="0"
                step="1"
                value={formState.price}
                className="mt-1"
                onChange={(event) => onUpdateForm({ ...formState, price: event.target.value })}
              />
            </label>
            <label className="block text-sm font-bold text-slate-700">
              Billing
              <select
                value={formState.billingInterval}
                className="mt-1 h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
                onChange={(event) =>
                  onUpdateForm({ ...formState, billingInterval: event.target.value as BillingInterval })
                }
              >
                <option value="monthly">Monthly</option>
                <option value="one-time">One-time</option>
              </select>
            </label>
          </div>
          <label className="block text-sm font-bold text-slate-700">
            Features
            <textarea
              value={formState.features}
              className="mt-1 min-h-24 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              onChange={(event) => onUpdateForm({ ...formState, features: event.target.value })}
            />
          </label>
          <label className="block text-sm font-bold text-slate-700">
            Color
            <select
              value={formState.color}
              className="mt-1 h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
              onChange={(event) => onUpdateForm({ ...formState, color: event.target.value })}
            >
              <option value="indigo">Indigo</option>
              <option value="yellow">Yellow</option>
              <option value="gray">Gray</option>
              <option value="purple">Purple</option>
            </select>
          </label>
          {error ? <p className="text-sm font-semibold text-red-600">{error}</p> : null}
          <DialogFooter>
            <button
              type="button"
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </button>
            <button type="submit" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-bold text-white">
              Save Package
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

async function fetchPackages() {
  try {
    const response = await fetch("/api/v1/packages?status=active&limit=100");

    if (!response.ok) {
      throw new Error("Packages API unavailable.");
    }

    const payload = (await response.json()) as { data: ApiPackage[] };
    return payload.data;
  } catch {
    return null;
  }
}

function buildPackageStats(packages: ApiPackage[]) {
  const monthlyPackages = packages.filter((coachingPackage) => coachingPackage.billingInterval === "monthly");
  const totalRevenue = packages.reduce((sum, coachingPackage) => sum + coachingPackage.projectedMonthlyRevenue, 0);
  const totalClients = packages.reduce((sum, coachingPackage) => sum + coachingPackage.activeSubscriptions, 0);
  const averageMonthlyPrice = monthlyPackages.length
    ? Math.round(monthlyPackages.reduce((sum, coachingPackage) => sum + coachingPackage.priceAmount, 0) / monthlyPackages.length)
    : 0;

  return [
    { label: "Total Packages", value: packages.length, icon: Package },
    { label: "Monthly Revenue", value: formatCents(totalRevenue), icon: DollarSign },
    { label: "Active Clients", value: totalClients, icon: Users },
    { label: "Avg. Package Price", value: formatCents(averageMonthlyPrice), icon: TrendingUp }
  ];
}

function mapFixturePackage(coachingPackage: (typeof fixturePackages)[number]): ApiPackage {
  const priceAmount = coachingPackage.price * 100;

  return {
    id: coachingPackage.id,
    name: coachingPackage.name,
    description: coachingPackage.description,
    priceAmount,
    currency: "usd",
    billingInterval: coachingPackage.billing === "monthly" ? "monthly" : "one-time",
    stripeProductId: null,
    stripePriceId: null,
    status: "active",
    features: coachingPackage.features,
    color: coachingPackage.color,
    activeSubscriptions: coachingPackage.activeClients,
    projectedMonthlyRevenue: coachingPackage.revenue * 100
  };
}

function packageToFormState(coachingPackage: ApiPackage): PackageFormState {
  return {
    name: coachingPackage.name,
    description: coachingPackage.description ?? "",
    price: String(coachingPackage.priceAmount / 100),
    billingInterval: coachingPackage.billingInterval,
    features: coachingPackage.features.join("\n"),
    color: coachingPackage.color ?? "indigo"
  };
}

function formStateToPayload(formState: PackageFormState) {
  const price = Number(formState.price);
  const name = formState.name.trim();

  if (!name || !Number.isFinite(price) || price < 0) {
    return null;
  }

  return {
    name,
    description: formState.description.trim() || undefined,
    priceAmount: Math.round(price * 100),
    currency: "usd",
    billingInterval: formState.billingInterval,
    features: formState.features
      .split("\n")
      .map((feature) => feature.trim())
      .filter(Boolean),
    color: formState.color || undefined
  };
}

function formatCents(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: amount % 100 === 0 ? 0 : 2
  }).format(amount / 100);
}
