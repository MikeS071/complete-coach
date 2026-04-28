export type ClientStatus = "active" | "archived" | "new" | "deactivated";

export interface ClientSummary {
  id: string;
  name: string;
  packageName: string;
  compliance: number;
  checkInDay: string;
  latestCheckIn: string;
  status: ClientStatus;
  startDate: string;
  initials: string;
  avatarColor: string;
}

export interface ClientMetric {
  label: string;
  value: string;
  detail: string;
  tone: string;
}

export interface ClientProfile extends ClientSummary {
  age: number;
  weeksWithCoach: number;
  protocol: string;
  bio: string;
  metrics: ClientMetric[];
  trainingSchedule: Array<{
    day: string;
    name: string;
    focus: string;
    duration: string;
  }>;
  nutritionPlan: {
    name: string;
    phase: string;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
  supplements: string[];
}

export const clients: ClientProfile[] = [
  {
    id: "1",
    name: "Marcus Rodriguez",
    packageName: "Elite Performance",
    compliance: 96,
    checkInDay: "Monday",
    latestCheckIn: "Apr 14, 2026",
    status: "active",
    startDate: "Jan 15, 2026",
    initials: "MR",
    avatarColor: "bg-slate-900",
    age: 32,
    weeksWithCoach: 24,
    protocol: "Hypertrophy II",
    bio: "Dedicated performance athlete focused on functional strength and metabolic conditioning.",
    metrics: [
      { label: "Current Weight", value: "88.4", detail: "kg, -0.4 this week", tone: "text-indigo-600" },
      { label: "Body Fat", value: "12.8%", detail: "-0.2 from last check-in", tone: "text-orange-600" },
      { label: "Habit Streak", value: "14", detail: "days in a row", tone: "text-green-600" },
      { label: "Recovery Score", value: "92", detail: "stable and ready", tone: "text-blue-600" }
    ],
    trainingSchedule: [
      { day: "Monday", name: "Upper Power", focus: "Pressing strength", duration: "75 min" },
      { day: "Wednesday", name: "Lower Strength", focus: "Squat and hinge", duration: "80 min" },
      { day: "Friday", name: "Upper Hypertrophy", focus: "Volume and isolation", duration: "70 min" },
      { day: "Sunday", name: "Active Recovery", focus: "Mobility and zone 2", duration: "45 min" }
    ],
    nutritionPlan: {
      name: "Aggressive Cutting Week 01",
      phase: "Cutting",
      calories: 2850,
      protein: 210,
      carbs: 320,
      fats: 85
    },
    supplements: ["Advanced Recovery Pack", "Creatine Monohydrate", "Electrolyte Support"]
  },
  {
    id: "2",
    name: "Emma Thompson",
    packageName: "Standard Package",
    compliance: 88,
    checkInDay: "Tuesday",
    latestCheckIn: "Apr 15, 2026",
    status: "active",
    startDate: "Feb 3, 2026",
    initials: "ET",
    avatarColor: "bg-indigo-600",
    age: 28,
    weeksWithCoach: 12,
    protocol: "Endurance Base",
    bio: "Endurance athlete building aerobic capacity before marathon-specific training.",
    metrics: [
      { label: "Current Weight", value: "62.1", detail: "kg, +0.2 this week", tone: "text-indigo-600" },
      { label: "Body Fat", value: "18.5%", detail: "-0.5 from last check-in", tone: "text-orange-600" },
      { label: "Habit Streak", value: "21", detail: "days in a row", tone: "text-green-600" },
      { label: "Recovery Score", value: "85", detail: "watch sleep quality", tone: "text-blue-600" }
    ],
    trainingSchedule: [
      { day: "Tuesday", name: "Tempo Run", focus: "Threshold pacing", duration: "55 min" },
      { day: "Thursday", name: "Strength Maintenance", focus: "Posterior chain", duration: "50 min" },
      { day: "Saturday", name: "Long Run", focus: "Aerobic base", duration: "90 min" }
    ],
    nutritionPlan: {
      name: "Marathon Base Fuel",
      phase: "Maintenance",
      calories: 2400,
      protein: 135,
      carbs: 310,
      fats: 70
    },
    supplements: ["Iron Support", "Electrolyte Support"]
  },
  {
    id: "3",
    name: "David Chen",
    packageName: "Premium Package",
    compliance: 92,
    checkInDay: "Wednesday",
    latestCheckIn: "Apr 16, 2026",
    status: "active",
    startDate: "Dec 10, 2025",
    initials: "DC",
    avatarColor: "bg-blue-600",
    age: 35,
    weeksWithCoach: 18,
    protocol: "Strength Rebuild",
    bio: "Returning strength athlete rebuilding volume tolerance after a deload block.",
    metrics: [
      { label: "Current Weight", value: "79.8", detail: "kg, stable", tone: "text-indigo-600" },
      { label: "Body Fat", value: "14.7%", detail: "-0.1 from last check-in", tone: "text-orange-600" },
      { label: "Habit Streak", value: "11", detail: "days in a row", tone: "text-green-600" },
      { label: "Recovery Score", value: "89", detail: "good trend", tone: "text-blue-600" }
    ],
    trainingSchedule: [
      { day: "Wednesday", name: "Heavy Lower", focus: "Squat progression", duration: "70 min" },
      { day: "Friday", name: "Upper Volume", focus: "Back and pressing", duration: "65 min" }
    ],
    nutritionPlan: {
      name: "Lean Performance",
      phase: "Maintenance",
      calories: 2750,
      protein: 190,
      carbs: 300,
      fats: 82
    },
    supplements: ["Creatine Monohydrate", "Vitamin D"]
  },
  {
    id: "4",
    name: "Sarah Martinez",
    packageName: "Standard Package",
    compliance: 84,
    checkInDay: "Thursday",
    latestCheckIn: "Apr 17, 2026",
    status: "new",
    startDate: "Apr 14, 2026",
    initials: "SM",
    avatarColor: "bg-rose-600",
    age: 31,
    weeksWithCoach: 1,
    protocol: "Foundation",
    bio: "New client completing baseline habits and movement assessment.",
    metrics: [
      { label: "Current Weight", value: "68.2", detail: "baseline", tone: "text-indigo-600" },
      { label: "Body Fat", value: "21.4%", detail: "baseline", tone: "text-orange-600" },
      { label: "Habit Streak", value: "5", detail: "days in a row", tone: "text-green-600" },
      { label: "Recovery Score", value: "78", detail: "building routine", tone: "text-blue-600" }
    ],
    trainingSchedule: [
      { day: "Thursday", name: "Movement Screen", focus: "Baseline assessment", duration: "45 min" }
    ],
    nutritionPlan: {
      name: "Baseline Tracking",
      phase: "Foundation",
      calories: 2100,
      protein: 145,
      carbs: 210,
      fats: 70
    },
    supplements: ["Habit Starter Pack"]
  },
  {
    id: "5",
    name: "James Wilson",
    packageName: "Elite Performance",
    compliance: 78,
    checkInDay: "Friday",
    latestCheckIn: "Apr 18, 2026",
    status: "deactivated",
    startDate: "Nov 20, 2025",
    initials: "JW",
    avatarColor: "bg-zinc-700",
    age: 40,
    weeksWithCoach: 20,
    protocol: "Paused",
    bio: "Temporarily deactivated while recovering from travel and schedule disruption.",
    metrics: [
      { label: "Current Weight", value: "91.5", detail: "last recorded", tone: "text-indigo-600" },
      { label: "Body Fat", value: "17.2%", detail: "last recorded", tone: "text-orange-600" },
      { label: "Habit Streak", value: "0", detail: "paused", tone: "text-green-600" },
      { label: "Recovery Score", value: "74", detail: "needs review", tone: "text-blue-600" }
    ],
    trainingSchedule: [],
    nutritionPlan: {
      name: "Paused Plan",
      phase: "Paused",
      calories: 2600,
      protein: 180,
      carbs: 260,
      fats: 85
    },
    supplements: []
  },
  {
    id: "6",
    name: "Jessica Taylor",
    packageName: "Premium Package",
    compliance: 94,
    checkInDay: "Saturday",
    latestCheckIn: "Apr 19, 2026",
    status: "active",
    startDate: "Feb 15, 2026",
    initials: "JT",
    avatarColor: "bg-purple-600",
    age: 29,
    weeksWithCoach: 10,
    protocol: "Performance Cut",
    bio: "High-compliance client preparing for a summer event block.",
    metrics: [
      { label: "Current Weight", value: "64.9", detail: "kg, -0.3 this week", tone: "text-indigo-600" },
      { label: "Body Fat", value: "19.1%", detail: "-0.4 from last check-in", tone: "text-orange-600" },
      { label: "Habit Streak", value: "18", detail: "days in a row", tone: "text-green-600" },
      { label: "Recovery Score", value: "91", detail: "strong", tone: "text-blue-600" }
    ],
    trainingSchedule: [
      { day: "Saturday", name: "Lower Volume", focus: "Glutes and hamstrings", duration: "65 min" }
    ],
    nutritionPlan: {
      name: "Performance Cut",
      phase: "Cutting",
      calories: 2200,
      protein: 155,
      carbs: 230,
      fats: 65
    },
    supplements: ["Creatine Monohydrate"]
  },
  {
    id: "7",
    name: "Michael Brown",
    packageName: "Standard Package",
    compliance: 90,
    checkInDay: "Sunday",
    latestCheckIn: "Apr 20, 2026",
    status: "active",
    startDate: "Jan 5, 2026",
    initials: "MB",
    avatarColor: "bg-emerald-700",
    age: 37,
    weeksWithCoach: 15,
    protocol: "Body Recomposition",
    bio: "General fitness client balancing strength, body composition, and lifestyle compliance.",
    metrics: [
      { label: "Current Weight", value: "83.6", detail: "kg, -0.1 this week", tone: "text-indigo-600" },
      { label: "Body Fat", value: "16.8%", detail: "-0.3 from last check-in", tone: "text-orange-600" },
      { label: "Habit Streak", value: "12", detail: "days in a row", tone: "text-green-600" },
      { label: "Recovery Score", value: "87", detail: "steady", tone: "text-blue-600" }
    ],
    trainingSchedule: [
      { day: "Sunday", name: "Full Body", focus: "Compound strength", duration: "60 min" }
    ],
    nutritionPlan: {
      name: "Recomp Baseline",
      phase: "Recomposition",
      calories: 2550,
      protein: 175,
      carbs: 260,
      fats: 78
    },
    supplements: ["Vitamin D", "Omega-3"]
  },
  {
    id: "8",
    name: "Ashley Davis",
    packageName: "Elite Performance",
    compliance: 86,
    checkInDay: "Monday",
    latestCheckIn: "Apr 14, 2026",
    status: "new",
    startDate: "Apr 16, 2026",
    initials: "AD",
    avatarColor: "bg-orange-600",
    age: 26,
    weeksWithCoach: 1,
    protocol: "Onboarding",
    bio: "New athlete entering baseline testing and nutrition calibration.",
    metrics: [
      { label: "Current Weight", value: "59.4", detail: "baseline", tone: "text-indigo-600" },
      { label: "Body Fat", value: "20.2%", detail: "baseline", tone: "text-orange-600" },
      { label: "Habit Streak", value: "4", detail: "days in a row", tone: "text-green-600" },
      { label: "Recovery Score", value: "82", detail: "good start", tone: "text-blue-600" }
    ],
    trainingSchedule: [
      { day: "Monday", name: "Baseline Strength", focus: "Movement quality", duration: "50 min" }
    ],
    nutritionPlan: {
      name: "Onboarding Baseline",
      phase: "Foundation",
      calories: 2050,
      protein: 135,
      carbs: 225,
      fats: 62
    },
    supplements: ["Electrolyte Support"]
  },
  {
    id: "9",
    name: "Robert Lee",
    packageName: "Premium Package",
    compliance: 82,
    checkInDay: "Tuesday",
    latestCheckIn: "Apr 15, 2026",
    status: "archived",
    startDate: "Aug 5, 2025",
    initials: "RL",
    avatarColor: "bg-cyan-700",
    age: 42,
    weeksWithCoach: 32,
    protocol: "Archived",
    bio: "Former client retained for historical profile review in the UI stub.",
    metrics: [
      { label: "Current Weight", value: "86.0", detail: "final recorded", tone: "text-indigo-600" },
      { label: "Body Fat", value: "15.9%", detail: "final recorded", tone: "text-orange-600" },
      { label: "Habit Streak", value: "0", detail: "archived", tone: "text-green-600" },
      { label: "Recovery Score", value: "80", detail: "final recorded", tone: "text-blue-600" }
    ],
    trainingSchedule: [],
    nutritionPlan: {
      name: "Archived Plan",
      phase: "Archived",
      calories: 2500,
      protein: 170,
      carbs: 250,
      fats: 80
    },
    supplements: []
  }
];

export const checkInDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export function getClientById(id: string) {
  return clients.find((client) => client.id === id);
}
