import { fireEvent, render, screen, within } from "@testing-library/react";
import { createElement } from "react";
import { describe, expect, it } from "vitest";
import { DashboardPage } from "@/components/dashboard/dashboard-page";

describe("DashboardPage", () => {
  it("renders fixture-backed dashboard cards and client activity", () => {
    render(createElement(DashboardPage));

    expect(screen.getByRole("heading", { level: 1, name: "Coach Operations Dashboard" })).toBeInTheDocument();
    expect(screen.getByText("Monthly Revenue")).toBeInTheDocument();
    expect(screen.getByText("$24,850")).toBeInTheDocument();
    expect(screen.getByText("Client Capacity")).toBeInTheDocument();
    expect(screen.getByText("42")).toBeInTheDocument();
    expect(screen.getByText("Payment Secured")).toBeInTheDocument();
    expect(screen.getByText("Coach Team")).toBeInTheDocument();
  });

  it("updates the displayed revenue period from the selector", () => {
    render(createElement(DashboardPage));

    fireEvent.click(screen.getByRole("button", { name: /change revenue period/i }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Weekly" }));

    expect(screen.getByText("Weekly Revenue")).toBeInTheDocument();
    expect(screen.getByText("$6,212")).toBeInTheDocument();
    expect(screen.queryByText("Monthly Revenue")).not.toBeInTheDocument();
  });

  it("toggles local work tasks as complete", () => {
    render(createElement(DashboardPage));

    const clientWork = screen.getByRole("region", { name: "Client Work" });
    const reviewTask = within(clientWork).getByRole("button", {
      name: /mark review jordan's progress check-in complete/i
    });

    fireEvent.click(reviewTask);

    expect(
      within(clientWork).getByRole("button", {
        name: /mark review jordan's progress check-in incomplete/i
      })
    ).toBeInTheDocument();
  });

  it("adds a local task through the task creation panel", () => {
    render(createElement(DashboardPage));

    fireEvent.click(screen.getByRole("button", { name: "Add Task" }));
    fireEvent.change(screen.getByLabelText("Task Description"), {
      target: { value: "Prepare onboarding packet" }
    });
    fireEvent.click(screen.getByRole("radio", { name: "Current Client Care" }));
    fireEvent.click(screen.getByRole("radio", { name: "High" }));
    fireEvent.click(screen.getByRole("button", { name: "Create Task" }));

    const clientWork = screen.getByRole("region", { name: "Client Work" });

    expect(within(clientWork).getByText("Prepare onboarding packet")).toBeInTheDocument();
    expect(screen.queryByRole("dialog", { name: "Create New Task" })).not.toBeInTheDocument();
  });
});
