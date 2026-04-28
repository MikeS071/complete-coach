export interface EducationResource {
  id: string;
  title: string;
  type: "PDF" | "Video" | "Article";
  category: "Training" | "Nutrition" | "Recovery" | "Mindset";
  gradient: string;
}

export const educationTabs = [
  "All Content",
  "Training Sessions",
  "Nutrition Kit",
  "Member Success",
  "Video Masterclasses"
] as const;

export const featuredEducationResource = {
  title: "Advanced Hypertrophy Mechanisms & Periodization",
  label: "Featured Content",
  summary: "Deep coaching curriculum for progression, fatigue management, and advanced training blocks."
};

export const educationResources: EducationResource[] = [
  {
    id: "nutrition-guide",
    title: "Nutrition Guide",
    type: "PDF",
    category: "Nutrition",
    gradient: "from-emerald-500 to-lime-500"
  },
  {
    id: "workout-video",
    title: "Workout Video",
    type: "Video",
    category: "Training",
    gradient: "from-indigo-600 to-slate-900"
  },
  {
    id: "recovery-tips",
    title: "Recovery Tips",
    type: "Article",
    category: "Recovery",
    gradient: "from-sky-500 to-cyan-300"
  },
  {
    id: "anatomy-guide",
    title: "Anatomy Guide",
    type: "PDF",
    category: "Training",
    gradient: "from-rose-500 to-orange-400"
  }
];

export const resourceCategories = ["Training", "Nutrition", "Recovery", "Mindset"] as const;

export const distributionOptions = [
  { id: "assign", label: "Assign to Clients" },
  { id: "library", label: "Add to Library" },
  { id: "morning", label: "Morning" },
  { id: "anytime", label: "Anytime" }
] as const;
