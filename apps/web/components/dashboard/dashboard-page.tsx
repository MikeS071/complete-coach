"use client";

import { useEffect, useState } from "react";

import { FinancialCard } from "./financial-card";
import { LivePipeline } from "./live-pipeline";
import { ClientCapacityCard, PriorityTasksCard, TeamSnapshotCard } from "./metric-cards";
import { TaskCreationPanel } from "./task-creation-panel";
import { WorkTodoSection } from "./work-todo-section";
import {
  dashboardTasks,
  revenueMetrics,
  type DashboardTask,
  type DashboardTaskCategory,
  type RevenuePeriod
} from "@/fixtures/dashboard";

interface ApiTask {
  id: string;
  title: string;
  category: DashboardTaskCategory;
  priority: "high" | "medium" | "low";
  status: "open" | "completed" | "cancelled";
}

interface ApiClient {
  id: string;
}

interface ApiCheckIn {
  id: string;
}

interface ApiPackage {
  projectedMonthlyRevenue: number;
}

export function DashboardPage() {
  const [period, setPeriod] = useState<RevenuePeriod>("monthly");
  const [periodMenuOpen, setPeriodMenuOpen] = useState(false);
  const [taskPanelOpen, setTaskPanelOpen] = useState(false);
  const [taskSource, setTaskSource] = useState<"api" | "fixture">("fixture");
  const [tasks, setTasks] = useState<Record<DashboardTaskCategory, DashboardTask[]>>(dashboardTasks);
  const [activeClientCount, setActiveClientCount] = useState(42);
  const [pendingCheckInCount, setPendingCheckInCount] = useState(5);
  const [revenueMetricSource, setRevenueMetricSource] = useState(revenueMetrics);

  useEffect(() => {
    let isActive = true;

    async function loadDashboardData() {
      const [tasksLoaded, activeClients, pendingCheckIns, packageRevenue] = await Promise.all([
        loadPersistedTasks(),
        loadCount<ApiClient>("/api/v1/clients?status=active&limit=100"),
        loadCount<ApiCheckIn>("/api/v1/check-ins?status=pending-review&limit=100"),
        loadPackageRevenueMetric()
      ]);

      if (!isActive) {
        return;
      }

      if (tasksLoaded) {
        setTaskSource("api");
        setTasks(tasksLoaded);
      } else {
        setTaskSource("fixture");
        setTasks(dashboardTasks);
      }

      if (activeClients !== null) {
        setActiveClientCount(activeClients);
      }

      if (pendingCheckIns !== null) {
        setPendingCheckInCount(pendingCheckIns);
      }

      if (packageRevenue !== null) {
        setRevenueMetricSource((currentMetrics) => ({
          ...currentMetrics,
          monthly: {
            ...currentMetrics.monthly,
            value: formatCents(packageRevenue),
            change: "Stripe-derived"
          }
        }));
      }
    }

    void loadDashboardData();

    return () => {
      isActive = false;
    };
  }, []);

  const toggleTask = async (category: DashboardTaskCategory, taskId: string) => {
    const targetTask = tasks[category].find((task) => task.id === taskId);

    if (!targetTask) {
      return;
    }

    setTasks((currentTasks) => ({
      ...currentTasks,
      [category]: currentTasks[category].map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    }));

    if (taskSource !== "api") {
      return;
    }

    try {
      const response = await fetch(
        targetTask.completed ? `/api/v1/tasks/${taskId}` : `/api/v1/tasks/${taskId}/complete`,
        {
          method: targetTask.completed ? "PATCH" : "POST",
          headers: targetTask.completed ? { "Content-Type": "application/json" } : undefined,
          body: targetTask.completed ? JSON.stringify({ status: "open" }) : undefined
        }
      );

      if (!response.ok) {
        throw new Error("Task persistence API unavailable.");
      }
    } catch {
      setTasks((currentTasks) => ({
        ...currentTasks,
        [category]: currentTasks[category].map((task) =>
          task.id === taskId ? { ...task, completed: targetTask.completed } : task
        )
      }));
    }
  };

  const handleCreateTask = async (task: {
    text: string;
    category: DashboardTaskCategory;
    priority: "high" | "medium" | "low";
  }) => {
    if (taskSource === "api") {
      try {
        const response = await fetch("/api/v1/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: task.text,
            category: task.category,
            priority: task.priority
          })
        });

        if (!response.ok) {
          throw new Error("Task persistence API unavailable.");
        }

        const payload = (await response.json()) as { data: ApiTask };
        appendTask(mapApiTask(payload.data));
        return;
      } catch {
        appendTask(createLocalDashboardTask(task.text, task.category), task.category);
        return;
      }
    }

    appendTask(createLocalDashboardTask(task.text, task.category), task.category);
  };

  function appendTask(nextTask: DashboardTask, category?: DashboardTaskCategory) {
    const targetCategory = category ?? nextTask.category ?? "current-client-care";

    setTasks((currentTasks) => ({
      ...currentTasks,
      [targetCategory]: [...currentTasks[targetCategory], nextTask]
    }));
  }

  function createLocalDashboardTask(text: string, category: DashboardTaskCategory): DashboardTask {
    return {
      id: `local-${Date.now()}`,
      text,
      completed: false,
      category
    };
  }

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">Coach Operations Dashboard</h1>
        <p className="text-gray-600">Monday, October 24th — 12 pipeline actions require attention.</p>
      </div>

      <div className="mb-8 grid gap-6 lg:grid-cols-3">
        <FinancialCard
          currentPeriod={period}
          metric={revenueMetricSource[period]}
          open={periodMenuOpen}
          onToggleOpen={() => setPeriodMenuOpen((open) => !open)}
          onSelectPeriod={(nextPeriod) => {
            setPeriod(nextPeriod);
            setPeriodMenuOpen(false);
          }}
        />
        <ClientCapacityCard activeClients={activeClientCount} />
        <PriorityTasksCard pendingCheckIns={pendingCheckInCount} />
      </div>

      <div className="mb-8 grid gap-6 lg:grid-cols-3">
        <WorkTodoSection tasks={tasks} onToggleTask={toggleTask} />
        <LivePipeline onAddTask={() => setTaskPanelOpen(true)} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <TeamSnapshotCard />
      </div>

      <TaskCreationPanel
        open={taskPanelOpen}
        onClose={() => setTaskPanelOpen(false)}
        onCreateTask={handleCreateTask}
      />
    </div>
  );
}

async function loadPersistedTasks() {
  try {
    const response = await fetch("/api/v1/tasks?limit=100");

    if (!response.ok) {
      throw new Error("Tasks API unavailable.");
    }

    const payload = (await response.json()) as { data: ApiTask[] };
    return payload.data.reduce<Record<DashboardTaskCategory, DashboardTask[]>>(
      (groupedTasks, task) => {
        groupedTasks[task.category].push(mapApiTask(task));
        return groupedTasks;
      },
      {
        "current-client-care": [],
        "social-media": [],
        "business-operations": []
      }
    );
  } catch {
    return null;
  }
}

async function loadCount<T>(url: string) {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Dashboard count API unavailable.");
    }

    const payload = (await response.json()) as { data: T[] };
    return payload.data.length;
  } catch {
    return null;
  }
}

async function loadPackageRevenueMetric() {
  try {
    const response = await fetch("/api/v1/packages?status=active&limit=100");

    if (!response.ok) {
      throw new Error("Packages API unavailable.");
    }

    const payload = (await response.json()) as { data: ApiPackage[] };
    return payload.data.reduce((sum, coachingPackage) => sum + coachingPackage.projectedMonthlyRevenue, 0);
  } catch {
    return null;
  }
}

function mapApiTask(task: ApiTask): DashboardTask {
  return {
    id: task.id,
    text: task.title,
    completed: task.status === "completed",
    category: task.category
  };
}

function formatCents(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: amount % 100 === 0 ? 0 : 2
  }).format(amount / 100);
}
