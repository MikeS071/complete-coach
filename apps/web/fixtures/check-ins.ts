export type CheckInTab = "pending" | "completed";
export type CheckInSort = "recent" | "oldest" | "name";

export interface CheckInRecord {
  id: string;
  name: string;
  initials: string;
  submittedAt: Date;
  assignedDay: Date;
  lastCheckIn: string;
  status: CheckInTab;
}

export const checkIns: CheckInRecord[] = [
  {
    id: "1",
    name: "Julian Reynolds",
    initials: "JR",
    submittedAt: new Date(2026, 3, 18, 8, 30),
    assignedDay: new Date(2026, 3, 18),
    lastCheckIn: "2 days ago",
    status: "pending"
  },
  {
    id: "2",
    name: "Elena Rodriguez",
    initials: "ER",
    submittedAt: new Date(2026, 3, 19, 10, 15),
    assignedDay: new Date(2026, 3, 19),
    lastCheckIn: "1 day ago",
    status: "pending"
  },
  {
    id: "3",
    name: "Marcus Chen",
    initials: "MC",
    submittedAt: new Date(2026, 3, 19, 6, 45),
    assignedDay: new Date(2026, 3, 20),
    lastCheckIn: "3 hours ago",
    status: "pending"
  },
  {
    id: "4",
    name: "Sarah Williams",
    initials: "SW",
    submittedAt: new Date(2026, 3, 20, 8, 0),
    assignedDay: new Date(2026, 3, 20),
    lastCheckIn: "5 hours ago",
    status: "pending"
  },
  {
    id: "5",
    name: "David Thompson",
    initials: "DT",
    submittedAt: new Date(2026, 3, 19, 11, 30),
    assignedDay: new Date(2026, 3, 19),
    lastCheckIn: "1 day ago",
    status: "pending"
  },
  {
    id: "6",
    name: "Alex Rivera",
    initials: "AR",
    submittedAt: new Date(2026, 3, 13, 8, 20),
    assignedDay: new Date(2026, 3, 13),
    lastCheckIn: "1 week ago",
    status: "completed"
  },
  {
    id: "7",
    name: "Jordan Smith",
    initials: "JS",
    submittedAt: new Date(2026, 3, 16, 7, 45),
    assignedDay: new Date(2026, 3, 16),
    lastCheckIn: "4 days ago",
    status: "completed"
  }
];

export function getTimingStatus(submittedAt: Date, assignedDay: Date) {
  const deadline = new Date(assignedDay);
  deadline.setHours(9, 0, 0, 0);

  const assignedDayStart = new Date(assignedDay);
  assignedDayStart.setHours(0, 0, 0, 0);

  if (submittedAt < assignedDayStart) {
    return { label: "Early", color: "text-blue-600 bg-blue-50" };
  }

  if (submittedAt <= deadline) {
    return { label: "On Time", color: "text-green-600 bg-green-50" };
  }

  return { label: "Late", color: "text-red-600 bg-red-50" };
}

export function formatSubmittedAt(date: Date) {
  return `${date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  })} at ${date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  })}`;
}
