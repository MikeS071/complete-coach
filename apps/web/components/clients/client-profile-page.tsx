"use client";

import Link from "next/link";
import { ChevronLeft, MessageSquare, Pencil } from "lucide-react";
import { useEffect, useState } from "react";

import { getClientById, type ClientProfile, type ClientSummary } from "@/fixtures/clients";
import { cn } from "@/lib/utils";

type ProfileTab = "Dashboard" | "Training" | "Nutrition" | "Supplementation";

interface ClientProfilePageProps {
  clientId: string;
}

interface ApiClientProfile {
  bio?: string | null;
  goals?: string[];
  dateOfBirth?: string | null;
}

interface ApiTrainingAssignment {
  id: string;
  name: string;
  status: "active" | "paused" | "completed" | "cancelled";
  startsOn: string;
  endsOn: string | null;
  snapshot: {
    templateName?: string;
    durationWeeks?: number;
    template?: {
      days?: Array<{
        name: string;
        exercises?: Array<{
          exerciseName: string;
          sets: number;
          reps: string;
        }>;
      }>;
    };
  };
}

interface ApiMealPlanAssignment {
  id: string;
  name: string;
  phase: string | null;
  status: "active" | "paused" | "completed" | "cancelled";
  targetCalories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  startsOn: string;
  endsOn: string | null;
  snapshot: {
    templateName?: string;
    phase?: string | null;
    targetCalories?: number;
    proteinGrams?: number;
    carbsGrams?: number;
    fatGrams?: number;
    template?: {
      days?: Array<{
        name: string;
        meals?: Array<{
          meal: string;
          foods?: Array<{
            foodName: string;
            servingSize: string;
            calories: number;
            proteinGrams: number;
            carbsGrams: number;
            fatGrams: number;
          }>;
        }>;
      }>;
    };
  };
}

interface ClientTrainingProgram {
  id: string;
  name: string;
  status: ApiTrainingAssignment["status"];
  startsOn: string;
  endsOn: string | null;
  durationWeeks: number;
  sessions: ClientProfile["trainingSchedule"];
}

interface ClientNutritionPlan {
  id: string;
  name: string;
  phase: string;
  status: ApiMealPlanAssignment["status"];
  startsOn: string;
  endsOn: string | null;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  meals: Array<{
    day: string;
    meal: string;
    foods: string;
    calories: number;
  }>;
}

interface ClientProfileView extends ClientProfile {
  trainingPrograms: ClientTrainingProgram[];
  trainingSource: "api" | "fixtures";
  nutritionPlans: ClientNutritionPlan[];
  nutritionSource: "api" | "fixtures";
}

const tabs: ProfileTab[] = ["Dashboard", "Training", "Nutrition", "Supplementation"];

export function ClientProfilePage({ clientId }: ClientProfilePageProps) {
  const [client, setClient] = useState<ClientProfileView | null>(() => {
    const fixtureClient = getClientById(clientId);

    return fixtureClient ? createProfileViewFromFixture(fixtureClient) : null;
  });
  const [loadingClient, setLoadingClient] = useState(!client);
  const [activeTab, setActiveTab] = useState<ProfileTab>("Dashboard");

  useEffect(() => {
    let active = true;

    async function loadClient() {
      try {
        const response = await fetch(`/api/v1/clients/${clientId}`);

        if (!response.ok) {
          return;
        }

        const payload = (await response.json()) as { data?: ClientSummary };

        if (active && payload.data) {
          const [profile, trainingAssignments, mealPlanAssignments] = await Promise.all([
            loadPersistedProfile(clientId),
            loadPersistedTraining(clientId),
            loadPersistedMealPlans(clientId)
          ]);

          setClient(createProfileFromSummary(payload.data, profile, trainingAssignments, mealPlanAssignments));
        }
      } catch {
        // Keep fixture fallback for UI preview environments without migrated client tables.
      } finally {
        if (active) {
          setLoadingClient(false);
        }
      }
    }

    void loadClient();

    return () => {
      active = false;
    };
  }, [clientId]);

  if (!client && loadingClient) {
    return (
      <div className="p-8">
        <p className="text-sm text-gray-500">Loading client profile...</p>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="p-8">
        <Link href="/clients" className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-indigo-600">
          <ChevronLeft className="size-4" aria-hidden="true" />
          Back to clients
        </Link>
        <section className="rounded-2xl border border-gray-200 bg-white p-10">
          <h1 className="mb-2 text-3xl font-bold">Client Not Found</h1>
          <p className="text-gray-600">The requested fixture client does not exist in this UI stub.</p>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8">
      <Link href="/clients" className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-indigo-600">
        <ChevronLeft className="size-4" aria-hidden="true" />
        Back to clients
      </Link>

      <ClientProfileHeader client={client} />
      <ClientMetricCards client={client} />

      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-2">
        <div role="tablist" aria-label="Client profile sections" className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={activeTab === tab}
              aria-controls={`client-tab-${tab}`}
              className={cn(
                "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                activeTab === tab ? "bg-indigo-600 text-white" : "text-gray-600 hover:bg-gray-100"
              )}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <ClientProfileTabPanel client={client} activeTab={activeTab} />
    </div>
  );
}

async function loadPersistedProfile(clientId: string) {
  const response = await fetch(`/api/v1/clients/${clientId}/profile`);

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as { data?: ApiClientProfile | null };

  return payload.data ?? null;
}

async function loadPersistedTraining(clientId: string) {
  const response = await fetch(`/api/v1/clients/${clientId}/training-programs`);

  if (!response.ok) {
    return [];
  }

  const payload = (await response.json()) as { data?: ApiTrainingAssignment[] };

  return Array.isArray(payload.data) ? payload.data : [];
}

async function loadPersistedMealPlans(clientId: string) {
  const response = await fetch(`/api/v1/clients/${clientId}/meal-plans`);

  if (!response.ok) {
    return [];
  }

  const payload = (await response.json()) as { data?: ApiMealPlanAssignment[] };

  return Array.isArray(payload.data) ? payload.data : [];
}

function createProfileFromSummary(
  summary: ClientSummary,
  profile?: ApiClientProfile | null,
  trainingAssignments: ApiTrainingAssignment[] = [],
  mealPlanAssignments: ApiMealPlanAssignment[] = []
): ClientProfileView {
  const trainingPrograms = createTrainingProgramsFromAssignments(trainingAssignments);
  const nutritionPlans = createNutritionPlansFromAssignments(mealPlanAssignments);
  const activeNutritionPlan = nutritionPlans[0];

  return {
    ...summary,
    age: getAge(profile?.dateOfBirth),
    weeksWithCoach: 0,
    protocol: profile?.goals?.[0] ?? "Unassigned",
    bio: profile?.bio ?? "Profile details are ready for persistence-backed coaching notes.",
    metrics: [
      {
        label: "Compliance",
        value: `${summary.compliance}%`,
        detail: "from persisted roster data",
        tone: "text-indigo-600"
      },
      {
        label: "Latest Check-In",
        value: summary.latestCheckIn,
        detail: "most recent persisted check-in",
        tone: "text-orange-600"
      },
      {
        label: "Status",
        value: summary.status,
        detail: "current client status",
        tone: "text-green-600"
      },
      {
        label: "Check-In Day",
        value: summary.checkInDay,
        detail: "scheduled cadence",
        tone: "text-blue-600"
      }
    ],
    trainingSchedule: trainingPrograms.flatMap((program) => program.sessions),
    trainingPrograms,
    trainingSource: "api",
    nutritionPlan: activeNutritionPlan
      ? {
          name: activeNutritionPlan.name,
          phase: activeNutritionPlan.phase,
          calories: activeNutritionPlan.calories,
          protein: activeNutritionPlan.protein,
          carbs: activeNutritionPlan.carbs,
          fats: activeNutritionPlan.fats
        }
      : {
          name: "Unassigned Nutrition Plan",
          phase: "Planning",
          calories: 0,
          protein: 0,
          carbs: 0,
          fats: 0
        },
    nutritionPlans,
    nutritionSource: "api",
    supplements: []
  };
}

function createProfileViewFromFixture(client: ClientProfile): ClientProfileView {
  return {
    ...client,
    trainingPrograms:
      client.trainingSchedule.length > 0
        ? [
            {
              id: `${client.id}-fixture-training`,
              name: client.protocol,
              status: "active",
              startsOn: client.startDate,
              endsOn: null,
              durationWeeks: client.weeksWithCoach,
              sessions: client.trainingSchedule
            }
          ]
        : [],
    trainingSource: "fixtures",
    nutritionPlans: [
      {
        id: `${client.id}-fixture-nutrition`,
        name: client.nutritionPlan.name,
        phase: client.nutritionPlan.phase,
        status: "active",
        startsOn: client.startDate,
        endsOn: null,
        calories: client.nutritionPlan.calories,
        protein: client.nutritionPlan.protein,
        carbs: client.nutritionPlan.carbs,
        fats: client.nutritionPlan.fats,
        meals: []
      }
    ],
    nutritionSource: "fixtures"
  };
}

export function createTrainingProgramsFromAssignments(
  assignments: ApiTrainingAssignment[]
): ClientTrainingProgram[] {
  return assignments.map((assignment) => ({
    id: assignment.id,
    name: assignment.name || assignment.snapshot.templateName || "Assigned training program",
    status: assignment.status,
    startsOn: assignment.startsOn,
    endsOn: assignment.endsOn,
    durationWeeks: assignment.snapshot.durationWeeks ?? 1,
    sessions:
      assignment.snapshot.template?.days?.map((day) => {
        const exercises = day.exercises ?? [];

        return {
          day: day.name,
          name: assignment.name,
          focus: exercises.length > 0 ? exercises.map((exercise) => exercise.exerciseName).join(", ") : "Assigned workout",
          duration: `${exercises.length} exercises`
        };
      }) ?? []
  }));
}

export function createNutritionPlansFromAssignments(
  assignments: ApiMealPlanAssignment[]
): ClientNutritionPlan[] {
  return assignments.map((assignment) => {
    const snapshot = assignment.snapshot;
    const name = assignment.name || snapshot.templateName || "Assigned meal plan";
    const phase = assignment.phase || snapshot.phase || "Nutrition";

    return {
      id: assignment.id,
      name,
      phase,
      status: assignment.status,
      startsOn: assignment.startsOn,
      endsOn: assignment.endsOn,
      calories: snapshot.targetCalories ?? assignment.targetCalories,
      protein: snapshot.proteinGrams ?? assignment.proteinGrams,
      carbs: snapshot.carbsGrams ?? assignment.carbsGrams,
      fats: snapshot.fatGrams ?? assignment.fatGrams,
      meals:
        snapshot.template?.days?.flatMap((day) =>
          (day.meals ?? []).map((meal) => ({
            day: day.name,
            meal: meal.meal,
            foods:
              meal.foods && meal.foods.length > 0
                ? meal.foods.map((food) => `${food.foodName} (${food.servingSize})`).join(", ")
                : "No foods recorded",
            calories: meal.foods?.reduce((total, food) => total + food.calories, 0) ?? 0
          }))
        ) ?? []
    };
  });
}

function getAge(dateOfBirth?: string | null) {
  if (!dateOfBirth) {
    return 0;
  }

  const birthDate = new Date(dateOfBirth);

  if (Number.isNaN(birthDate.getTime())) {
    return 0;
  }

  const today = new Date();
  let age = today.getUTCFullYear() - birthDate.getUTCFullYear();
  const monthDelta = today.getUTCMonth() - birthDate.getUTCMonth();
  const birthdayPassed =
    monthDelta > 0 || (monthDelta === 0 && today.getUTCDate() >= birthDate.getUTCDate());

  if (!birthdayPassed) {
    age -= 1;
  }

  return age;
}

function ClientProfileHeader({ client }: { client: ClientProfile }) {
  return (
    <section className="mb-6 overflow-hidden rounded-2xl border border-gray-200 bg-white">
      <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-indigo-800 p-6 text-white">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="flex items-center gap-4">
            <div className={cn("flex size-20 items-center justify-center rounded-2xl text-2xl font-bold", client.avatarColor)}>
              {client.initials}
            </div>
            <div>
              <p className="mb-1 text-xs uppercase tracking-[0.24em] text-indigo-200">{client.packageName}</p>
              <h1 className="text-3xl font-bold">{client.name}</h1>
              <p className="mt-2 max-w-2xl text-sm text-indigo-100">{client.bio}</p>
            </div>
          </div>

          <div className="flex gap-2">
            <button type="button" className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm font-medium transition-colors hover:bg-white/20">
              <MessageSquare className="size-4" aria-hidden="true" />
              Message
            </button>
            <button type="button" className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-slate-950 transition-colors hover:bg-indigo-50">
              <Pencil className="size-4" aria-hidden="true" />
              Edit
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 p-6 text-sm md:grid-cols-4">
        <ProfileFact label="Age" value={`${client.age}`} />
        <ProfileFact label="Weeks with coach" value={`${client.weeksWithCoach}`} />
        <ProfileFact label="Check-in day" value={client.checkInDay} />
        <ProfileFact label="Current protocol" value={client.protocol} />
      </div>
    </section>
  );
}

function ProfileFact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="mb-1 text-xs uppercase tracking-wider text-gray-500">{label}</div>
      <div className="font-semibold text-gray-900">{value}</div>
    </div>
  );
}

function ClientMetricCards({ client }: { client: ClientProfile }) {
  return (
    <div className="mb-6 grid gap-4 md:grid-cols-4">
      {client.metrics.map((metric) => (
        <section key={metric.label} className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="mb-1 text-xs uppercase text-gray-500">{metric.label}</div>
          <div className={cn("mb-1 text-2xl font-bold", metric.tone)}>{metric.value}</div>
          <div className="text-xs text-gray-500">{metric.detail}</div>
        </section>
      ))}
    </div>
  );
}

function ClientProfileTabPanel({ client, activeTab }: { client: ClientProfileView; activeTab: ProfileTab }) {
  return (
    <section
      id={`client-tab-${activeTab}`}
      role="tabpanel"
      aria-label={activeTab}
      className="rounded-xl border border-gray-200 bg-white p-6"
    >
      {activeTab === "Dashboard" ? <DashboardPanel client={client} /> : null}
      {activeTab === "Training" ? <TrainingPanel client={client} /> : null}
      {activeTab === "Nutrition" ? <NutritionPanel client={client} /> : null}
      {activeTab === "Supplementation" ? <SupplementationPanel client={client} /> : null}
    </section>
  );
}

function DashboardPanel({ client }: { client: ClientProfile }) {
  return (
    <div>
      <h2 className="mb-4 text-xl font-bold">Progress Overview</h2>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl bg-indigo-50 p-4">
          <div className="text-xs uppercase text-indigo-700">Compliance</div>
          <div className="mt-2 text-3xl font-bold text-indigo-700">{client.compliance}%</div>
        </div>
        <div className="rounded-xl bg-orange-50 p-4">
          <div className="text-xs uppercase text-orange-700">Latest Check-In</div>
          <div className="mt-2 text-lg font-semibold text-orange-700">{client.latestCheckIn}</div>
        </div>
        <div className="rounded-xl bg-gray-50 p-4">
          <div className="text-xs uppercase text-gray-600">Status</div>
          <div className="mt-2 text-lg font-semibold capitalize text-gray-900">{client.status}</div>
        </div>
      </div>
    </div>
  );
}

function TrainingPanel({ client }: { client: ClientProfileView }) {
  return (
    <div>
      <h2 className="mb-4 text-xl font-bold">Assigned Training Programs</h2>
      <div className="mb-6 grid gap-4 md:grid-cols-2">
        {client.trainingPrograms.length > 0 ? (
          client.trainingPrograms.map((program) => (
            <article key={program.id} className="rounded-xl border border-gray-200 p-4">
              <div className="mb-2 flex items-center justify-between gap-3">
                <h3 className="font-semibold text-gray-900">{program.name}</h3>
                <span className="rounded-full bg-indigo-50 px-2 py-1 text-xs font-medium capitalize text-indigo-700">
                  {program.status}
                </span>
              </div>
              <p className="text-sm text-gray-600">{program.durationWeeks} week program</p>
              <p className="mt-2 text-xs text-gray-500">
                Started {formatTrainingDate(program.startsOn)}
                {program.endsOn ? ` - Ends ${formatTrainingDate(program.endsOn)}` : ""}
              </p>
            </article>
          ))
        ) : (
          <p className="text-sm text-gray-500">No persisted training programs have been assigned yet.</p>
        )}
      </div>

      <h2 className="mb-4 text-xl font-bold">Weekly Training Schedule</h2>
      <div className="grid gap-3 md:grid-cols-2">
        {client.trainingSchedule.length > 0 ? (
          client.trainingSchedule.map((session) => (
            <article key={`${session.day}-${session.name}`} className="rounded-xl border border-gray-200 p-4">
              <div className="mb-1 text-xs uppercase text-gray-500">{session.day}</div>
              <h3 className="font-semibold">{session.name}</h3>
              <p className="mt-1 text-sm text-gray-600">{session.focus}</p>
              <p className="mt-2 text-xs text-indigo-600">{session.duration}</p>
            </article>
          ))
        ) : (
          <p className="text-sm text-gray-500">
            {client.trainingSource === "api"
              ? "No scheduled sessions were found in persisted training assignments."
              : "No active training sessions in this fixture profile."}
          </p>
        )}
      </div>
    </div>
  );
}

function formatTrainingDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(value));
}

function NutritionPanel({ client }: { client: ClientProfileView }) {
  const activePlan = client.nutritionPlans[0];

  return (
    <div>
      <div className="mb-4 flex flex-col justify-between gap-3 md:flex-row md:items-start">
        <div>
          <h2 className="text-xl font-bold">{client.nutritionPlan.name}</h2>
          <p className="mt-1 text-sm text-gray-600">
            {client.nutritionPlan.phase}
            {activePlan ? ` - ${activePlan.status}` : ""}
          </p>
        </div>
        {activePlan ? (
          <p className="text-xs text-gray-500">
            Started {formatTrainingDate(activePlan.startsOn)}
            {activePlan.endsOn ? ` - Ends ${formatTrainingDate(activePlan.endsOn)}` : ""}
          </p>
        ) : null}
      </div>
      <div className="grid gap-3 md:grid-cols-4">
        <MacroTile label="Calories" value={`${client.nutritionPlan.calories}`} />
        <MacroTile label="Protein" value={`${client.nutritionPlan.protein}g`} />
        <MacroTile label="Carbs" value={`${client.nutritionPlan.carbs}g`} />
        <MacroTile label="Fats" value={`${client.nutritionPlan.fats}g`} />
      </div>
      <h3 className="mt-6 mb-3 text-lg font-semibold">Meal Schedule</h3>
      <div className="grid gap-3 md:grid-cols-2">
        {activePlan?.meals.length ? (
          activePlan.meals.map((meal) => (
            <article key={`${meal.day}-${meal.meal}`} className="rounded-xl border border-gray-200 p-4">
              <div className="mb-1 text-xs uppercase text-gray-500">{meal.day}</div>
              <h4 className="font-semibold text-gray-900">{meal.meal}</h4>
              <p className="mt-1 text-sm text-gray-600">{meal.foods}</p>
              <p className="mt-2 text-xs text-green-700">{meal.calories} calories</p>
            </article>
          ))
        ) : (
          <p className="text-sm text-gray-500">
            {client.nutritionSource === "api"
              ? "No persisted meal schedule has been assigned yet."
              : "No meal schedule is available in this fixture profile."}
          </p>
        )}
      </div>
    </div>
  );
}

function MacroTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-gray-50 p-4 text-center">
      <div className="mb-1 text-xs uppercase text-gray-500">{label}</div>
      <div className="text-xl font-bold">{value}</div>
    </div>
  );
}

function SupplementationPanel({ client }: { client: ClientProfile }) {
  return (
    <div>
      <h2 className="mb-4 text-xl font-bold">Active Supplementation</h2>
      <div className="space-y-2">
        {client.supplements.length > 0 ? (
          client.supplements.map((supplement) => (
            <div key={supplement} className="rounded-lg border border-gray-200 p-3 text-sm">
              {supplement}
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500">No active supplements in this fixture profile.</p>
        )}
      </div>
    </div>
  );
}
