export interface ShellNotification {
  id: string;
  type: "check-in" | "message" | "form" | "task";
  title: string;
  message: string;
  time: string;
  unread: boolean;
}

export const initialNotifications: ShellNotification[] = [
  {
    id: "check-in-1",
    type: "check-in",
    title: "New Check-In Submitted",
    message: "Julian Reynolds submitted their weekly check-in",
    time: "5 minutes ago",
    unread: true
  },
  {
    id: "message-1",
    type: "message",
    title: "New Message",
    message: "Sarah Williams asked about her meal plan",
    time: "1 hour ago",
    unread: true
  },
  {
    id: "form-1",
    type: "form",
    title: "Form Completed",
    message: "Marcus Chen completed the onboarding questionnaire",
    time: "2 hours ago",
    unread: true
  },
  {
    id: "task-1",
    type: "task",
    title: "Check-In Reminder",
    message: "3 clients have pending check-ins due today",
    time: "3 hours ago",
    unread: false
  }
];
