export interface SupplementProtocol {
  id: string;
  name: string;
  category: "Performance" | "Recovery" | "Endurance" | "Health";
  supplements: string[];
  clients: number;
  adherence: number;
}

export interface InventoryItem {
  name: string;
  stock: number;
  reorder: number;
  unit: string;
}

export interface ActiveSupplementProtocol {
  id: string;
  clientName: string;
  protocol: string;
  supplements: string[];
  status: "Active" | "In Review";
  compliance: number;
}

export interface ProtocolTemplate {
  id: string;
  name: string;
  category: "General Health" | "Performance" | "Recovery";
  description: string;
  supplements: number;
}

export interface SupplementEntry {
  id: string;
  name: string;
  category: string;
  timing: string;
  dosage: string;
  coachNote: string;
}

export const supplementProtocols: SupplementProtocol[] = [
  {
    id: "performance-stack",
    name: "Performance Stack",
    category: "Performance",
    supplements: ["Creatine Monohydrate", "Beta-Alanine", "Citrulline Malate", "Caffeine"],
    clients: 22,
    adherence: 85
  },
  {
    id: "recovery-essentials",
    name: "Recovery Essentials",
    category: "Recovery",
    supplements: ["Whey Protein", "Omega-3", "Vitamin D", "Magnesium"],
    clients: 30,
    adherence: 92
  },
  {
    id: "endurance-support",
    name: "Endurance Support",
    category: "Endurance",
    supplements: ["Electrolytes", "BCAAs", "Iron", "B-Complex"],
    clients: 15,
    adherence: 78
  },
  {
    id: "joint-health",
    name: "Joint Health Protocol",
    category: "Health",
    supplements: ["Glucosamine", "Chondroitin", "Collagen", "Turmeric"],
    clients: 12,
    adherence: 88
  }
];

export const inventoryItems: InventoryItem[] = [
  { name: "Creatine Monohydrate", stock: 45, reorder: 20, unit: "bottles" },
  { name: "Whey Protein Isolate", stock: 12, reorder: 30, unit: "bottles" },
  { name: "Omega-3 Fish Oil", stock: 67, reorder: 25, unit: "bottles" },
  { name: "Vitamin D3", stock: 8, reorder: 15, unit: "bottles" }
];

export const activeSupplementProtocols: ActiveSupplementProtocol[] = [
  {
    id: "alex-rivera-d3",
    clientName: "Alex Rivera",
    protocol: "Vitamin D3 + K2",
    supplements: ["Vitamin D", "Vitamin K"],
    status: "Active",
    compliance: 95
  },
  {
    id: "james-chen-stack",
    clientName: "James Chen",
    protocol: "Multi Hypertrophy Stack",
    supplements: ["Creatine", "Beta-Alanine", "L-Citrulline"],
    status: "In Review",
    compliance: 67
  }
];

export const protocolLibrary: ProtocolTemplate[] = [
  {
    id: "vitamin-d3-k2",
    name: "Vitamin D3 + K2",
    category: "General Health",
    description: "Bone health support and immune optimization with calcium absorption support.",
    supplements: 2
  },
  {
    id: "creatine",
    name: "Creatine Monohydrate",
    category: "Performance",
    description: "Strength and muscle mass support for high-intensity performance and cellular energy production.",
    supplements: 1
  },
  {
    id: "magnesium",
    name: "Magnesium Bisglycinate",
    category: "Recovery",
    description: "Sleep quality and muscle recovery support with reduced muscle cramp risk.",
    supplements: 1
  }
];

export const supplementEntries: SupplementEntry[] = [
  {
    id: "magnesium-glycinate",
    name: "Magnesium Glycinate",
    category: "Evening",
    timing: "Once evening",
    dosage: "400mg",
    coachNote: "Best paired with the sleep routine for recovery blocks."
  },
  {
    id: "creatine-monohydrate",
    name: "Creatine Monohydrate",
    category: "Anytime",
    timing: "Once anytime",
    dosage: "5g",
    coachNote: "Keep daily intake consistent on training and rest days."
  },
  {
    id: "omega-3",
    name: "Omega-3 High EPA",
    category: "Morning",
    timing: "Twice with meals",
    dosage: "2g",
    coachNote: "Pair with meals containing fat for absorption."
  }
];
