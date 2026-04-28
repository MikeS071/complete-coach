export interface Conversation {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
  initials: string;
}

export interface ChatMessage {
  id: string;
  sender: "coach" | "client";
  text: string;
  time: string;
}

export const conversations: Conversation[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    lastMessage: "Thanks for the updated meal plan!",
    time: "2m ago",
    unread: 2,
    online: true,
    initials: "SJ"
  },
  {
    id: "2",
    name: "Marcus Chen",
    lastMessage: "Can we reschedule tomorrow's session?",
    time: "15m ago",
    unread: 1,
    online: true,
    initials: "MC"
  },
  {
    id: "3",
    name: "Emma Rodriguez",
    lastMessage: "Just finished today's workout!",
    time: "1h ago",
    unread: 0,
    online: false,
    initials: "ER"
  },
  {
    id: "4",
    name: "Jordan Williams",
    lastMessage: "Looking forward to the check-in tomorrow",
    time: "3h ago",
    unread: 0,
    online: false,
    initials: "JW"
  }
];

export const initialConversationMessages: Record<string, ChatMessage[]> = {
  "1": [
    { id: "1-1", sender: "client", text: "Hey! I've been following the meal plan for a week now", time: "10:30 AM" },
    { id: "1-2", sender: "coach", text: "That's great to hear. How are you feeling so far?", time: "10:32 AM" },
    { id: "1-3", sender: "client", text: "Much better. Energy levels are up and I'm not feeling as bloated", time: "10:35 AM" },
    { id: "1-4", sender: "coach", text: "Perfect. That's exactly what we want to see. Keep it up.", time: "10:36 AM" },
    { id: "1-5", sender: "client", text: "Thanks for the updated meal plan!", time: "11:45 AM" }
  ],
  "2": [
    { id: "2-1", sender: "client", text: "Hi coach, I have a scheduling conflict tomorrow", time: "9:15 AM" },
    { id: "2-2", sender: "coach", text: "No problem. What time works better for you?", time: "9:20 AM" },
    { id: "2-3", sender: "client", text: "Can we reschedule tomorrow's session?", time: "9:25 AM" }
  ],
  "3": [
    { id: "3-1", sender: "client", text: "Just finished today's workout!", time: "2:30 PM" },
    { id: "3-2", sender: "coach", text: "Amazing work. How did the HIIT section feel?", time: "2:35 PM" },
    { id: "3-3", sender: "client", text: "Challenging, but I pushed through.", time: "2:40 PM" }
  ],
  "4": [
    { id: "4-1", sender: "client", text: "Ready for tomorrow's check-in.", time: "Yesterday" },
    { id: "4-2", sender: "coach", text: "Great. Make sure to take your progress photos.", time: "Yesterday" }
  ]
};

export const packages = [
  {
    id: "platinum",
    name: "Platinum Elite",
    price: 599,
    billing: "monthly",
    activeClients: 12,
    description: "Complete coaching with 24/7 support",
    features: ["Custom training programs", "Personalized meal plans", "Weekly check-ins", "24/7 text support"],
    color: "indigo",
    revenue: 7188
  },
  {
    id: "gold",
    name: "Gold Standard",
    price: 399,
    billing: "monthly",
    activeClients: 18,
    description: "Premium coaching with weekly support",
    features: ["Custom training programs", "Macro tracking", "Bi-weekly check-ins", "Group Q&A sessions"],
    color: "yellow",
    revenue: 7182
  },
  {
    id: "silver",
    name: "Silver Start",
    price: 199,
    billing: "monthly",
    activeClients: 8,
    description: "Essential coaching for beginners",
    features: ["Template programs", "Basic nutrition guide", "Monthly check-ins", "Email support"],
    color: "gray",
    revenue: 1592
  },
  {
    id: "transform",
    name: "12-Week Transform",
    price: 1499,
    billing: "one-time",
    activeClients: 4,
    description: "Intensive transformation program",
    features: ["12-week custom program", "Full meal planning", "Weekly video calls", "Priority support"],
    color: "purple",
    revenue: 5996
  }
];

export const teamMembers = [
  { id: "alex", name: "Alex Rodriguez", role: "Strength Coach", email: "alex@completecoach.com", phone: "(555) 123-4567", status: "active", clients: 18, load: 72 },
  { id: "maya", name: "Maya Patel", role: "Nutritionist", email: "maya@completecoach.com", phone: "(555) 234-5678", status: "active", clients: 24, load: 96 },
  { id: "jordan", name: "Jordan Lee", role: "Cardio Specialist", email: "jordan@completecoach.com", phone: "(555) 345-6789", status: "active", clients: 15, load: 60 },
  { id: "sofia", name: "Sofia Martinez", role: "Admin Assistant", email: "sofia@completecoach.com", phone: "(555) 456-7890", status: "away", clients: 0, load: 34 }
];

export const teamTasks = [
  { id: "task-1", assignee: "Alex Rodriguez", task: "Review Marcus Chen's program", dueDate: "Today" },
  { id: "task-2", assignee: "Maya Patel", task: "Create meal plans for 3 new clients", dueDate: "Tomorrow" },
  { id: "task-3", assignee: "Jordan Lee", task: "Conduct group cardio class", dueDate: "Wed, Oct 26" }
];

export const socialAnalytics = [
  { label: "Reach", value: "24.5K", change: "+12%" },
  { label: "Engagement", value: "3.2K", change: "+8%" },
  { label: "New Followers", value: "342", change: "+23%" },
  { label: "Conversion Rate", value: "4.8%", change: "+2%" }
];

export const scheduledPosts = [
  { id: "post-1", platform: "Instagram", content: "Transformation Tuesday: Sarah's 12-week journey", scheduled: "Today, 2:00 PM", status: "scheduled" },
  { id: "post-2", platform: "Facebook", content: "New nutrition guide: 5 Pre-Workout Meals", scheduled: "Tomorrow, 10:00 AM", status: "draft" },
  { id: "post-3", platform: "Twitter", content: "Quick tip: Hydration matters more than you think...", scheduled: "Tomorrow, 4:00 PM", status: "scheduled" }
];
