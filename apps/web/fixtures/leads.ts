export type LeadStatus = "hot" | "warm" | "cold";
export type LeadStageId = "initial-contact" | "consultation" | "proposal" | "negotiation" | "closed-won";

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  source: string;
  lastContact: string;
  notes: string;
  location: string;
  status: LeadStatus;
  stage: LeadStageId;
  daysInStage: number;
  initials: string;
}

export interface LeadStage {
  id: LeadStageId;
  title: string;
  color: string;
}

export const pipelineStages: LeadStage[] = [
  { id: "initial-contact", title: "Initial Contact", color: "bg-gray-50" },
  { id: "consultation", title: "Consultation Scheduled", color: "bg-blue-50" },
  { id: "proposal", title: "Proposal Sent", color: "bg-purple-50" },
  { id: "negotiation", title: "In Negotiation", color: "bg-yellow-50" },
  { id: "closed-won", title: "Closed - Won", color: "bg-green-50" }
];

export const leads: Lead[] = [
  {
    id: "1",
    name: "Jessica Martinez",
    email: "jessica.m@email.com",
    phone: "+1 (555) 123-4567",
    status: "hot",
    source: "Instagram",
    lastContact: "2 days ago",
    notes: "Interested in premium package",
    location: "Los Angeles, CA",
    stage: "initial-contact",
    daysInStage: 2,
    initials: "JM"
  },
  {
    id: "2",
    name: "Michael Chen",
    email: "m.chen@email.com",
    phone: "+1 (555) 234-5678",
    status: "warm",
    source: "Referral",
    lastContact: "5 days ago",
    notes: "Looking for weight loss program",
    location: "San Francisco, CA",
    stage: "consultation",
    daysInStage: 5,
    initials: "MC"
  },
  {
    id: "3",
    name: "Amanda Foster",
    email: "amanda.foster@email.com",
    phone: "+1 (555) 345-6789",
    status: "cold",
    source: "Website",
    lastContact: "2 weeks ago",
    notes: "Requested information packet",
    location: "Seattle, WA",
    stage: "initial-contact",
    daysInStage: 14,
    initials: "AF"
  },
  {
    id: "4",
    name: "David Thompson",
    email: "d.thompson@email.com",
    phone: "+1 (555) 456-7890",
    status: "hot",
    source: "Facebook",
    lastContact: "1 day ago",
    notes: "Ready to start immediately",
    location: "Austin, TX",
    stage: "proposal",
    daysInStage: 1,
    initials: "DT"
  },
  {
    id: "5",
    name: "Sarah Johnson",
    email: "sarah.j@email.com",
    phone: "+1 (555) 567-8901",
    status: "warm",
    source: "Instagram",
    lastContact: "4 days ago",
    notes: "Interested in nutrition coaching",
    location: "Miami, FL",
    stage: "negotiation",
    daysInStage: 4,
    initials: "SJ"
  },
  {
    id: "6",
    name: "Robert Lee",
    email: "r.lee@email.com",
    phone: "+1 (555) 678-9012",
    status: "hot",
    source: "Referral",
    lastContact: "3 hours ago",
    notes: "Former athlete, needs strength training",
    location: "Denver, CO",
    stage: "consultation",
    daysInStage: 1,
    initials: "RL"
  },
  {
    id: "7",
    name: "Emily Rodriguez",
    email: "emily.r@email.com",
    phone: "+1 (555) 789-0123",
    status: "warm",
    source: "Website",
    lastContact: "1 week ago",
    notes: "Wants meal planning service",
    location: "Portland, OR",
    stage: "proposal",
    daysInStage: 7,
    initials: "ER"
  }
];
