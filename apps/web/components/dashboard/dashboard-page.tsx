"use client";

import { useState } from "react";

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

export function DashboardPage() {
  const [period, setPeriod] = useState<RevenuePeriod>("monthly");
  const [periodMenuOpen, setPeriodMenuOpen] = useState(false);
  const [taskPanelOpen, setTaskPanelOpen] = useState(false);
  const [tasks, setTasks] = useState<Record<DashboardTaskCategory, DashboardTask[]>>(dashboardTasks);

  const toggleTask = (category: DashboardTaskCategory, taskId: string) => {
    setTasks((currentTasks) => ({
      ...currentTasks,
      [category]: currentTasks[category].map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    }));
  };

  const handleCreateTask = (task: { text: string; category: DashboardTaskCategory }) => {
    const nextTask: DashboardTask = {
      id: `local-${Date.now()}`,
      text: task.text,
      completed: false
    };

    setTasks((currentTasks) => ({
      ...currentTasks,
      [task.category]: [...currentTasks[task.category], nextTask]
    }));
  };

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">Coach Operations Dashboard</h1>
        <p className="text-gray-600">Monday, October 24th — 12 pipeline actions require attention.</p>
      </div>

      <div className="mb-8 grid gap-6 lg:grid-cols-3">
        <FinancialCard
          currentPeriod={period}
          metric={revenueMetrics[period]}
          open={periodMenuOpen}
          onToggleOpen={() => setPeriodMenuOpen((open) => !open)}
          onSelectPeriod={(nextPeriod) => {
            setPeriod(nextPeriod);
            setPeriodMenuOpen(false);
          }}
        />
        <ClientCapacityCard />
        <PriorityTasksCard />
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
