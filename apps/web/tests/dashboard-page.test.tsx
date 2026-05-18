import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { createElement } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DashboardPage } from "@/components/dashboard/dashboard-page";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("DashboardPage", () => {
  it("renders fixture-backed dashboard cards and client activity", () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("API unavailable"));

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
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("API unavailable"));

    render(createElement(DashboardPage));

    fireEvent.click(screen.getByRole("button", { name: /change revenue period/i }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Weekly" }));

    expect(screen.getByText("Weekly Revenue")).toBeInTheDocument();
    expect(screen.getByText("$6,212")).toBeInTheDocument();
    expect(screen.queryByText("Monthly Revenue")).not.toBeInTheDocument();
  });

  it("toggles local work tasks as complete", () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("API unavailable"));

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
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("API unavailable"));

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

  it("loads persisted dashboard tasks and live summary counts when APIs are available", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation((input) => {
      const url = String(input);

      if (url === "/api/v1/tasks?limit=100") {
        return Promise.resolve(
          new Response(
            JSON.stringify({
              data: [
                {
                  id: "task_api_1",
                  title: "Persisted client review",
                  category: "current-client-care",
                  priority: "high",
                  status: "open"
                }
              ]
            }),
            { status: 200 }
          )
        );
      }

      if (url === "/api/v1/clients?status=active&limit=100") {
        return Promise.resolve(
          new Response(JSON.stringify({ data: [{ id: "client_1" }, { id: "client_2" }, { id: "client_3" }] }), {
            status: 200
          })
        );
      }

      if (url === "/api/v1/check-ins?status=pending-review&limit=100") {
        return Promise.resolve(
          new Response(JSON.stringify({ data: [{ id: "checkin_1" }, { id: "checkin_2" }] }), { status: 200 })
        );
      }

      return Promise.resolve(new Response(JSON.stringify({ data: [] }), { status: 200 }));
    });

    render(createElement(DashboardPage));

    expect(await screen.findByText("Persisted client review")).toBeInTheDocument();
    expect(screen.getByText("4% LOAD")).toBeInTheDocument();
    expect(screen.getByText("Room for 81 more premium athletes")).toBeInTheDocument();
    const checkInsCard = screen.getByText("Check Ins").closest("section");
    expect(checkInsCard).not.toBeNull();
    expect(within(checkInsCard as HTMLElement).getAllByText("2")).toHaveLength(2);
    expect(within(checkInsCard as HTMLElement).getByText("Pending")).toBeInTheDocument();
  });

  it("creates dashboard tasks through the task API when persistence is available", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation((input, init) => {
      const url = String(input);

      if (url === "/api/v1/tasks?limit=100") {
        return Promise.resolve(new Response(JSON.stringify({ data: [] }), { status: 200 }));
      }

      if (url === "/api/v1/tasks" && init?.method === "POST") {
        return Promise.resolve(
          new Response(
            JSON.stringify({
              data: {
                id: "task_created",
                title: "Persisted dashboard task",
                category: "current-client-care",
                priority: "high",
                status: "open"
              }
            }),
            { status: 201 }
          )
        );
      }

      return Promise.resolve(new Response(JSON.stringify({ data: [] }), { status: 200 }));
    });

    render(createElement(DashboardPage));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith("/api/v1/tasks?limit=100"));

    fireEvent.click(screen.getByRole("button", { name: "Add Task" }));
    fireEvent.change(screen.getByLabelText("Task Description"), {
      target: { value: "Persisted dashboard task" }
    });
    fireEvent.click(screen.getByRole("radio", { name: "Current Client Care" }));
    fireEvent.click(screen.getByRole("radio", { name: "High" }));
    fireEvent.click(screen.getByRole("button", { name: "Create Task" }));

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/v1/tasks",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({
            title: "Persisted dashboard task",
            category: "current-client-care",
            priority: "high"
          })
        })
      )
    );
    expect(await screen.findByText("Persisted dashboard task")).toBeInTheDocument();
  });

  it("completes persisted dashboard tasks through the task API", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation((input, init) => {
      const url = String(input);

      if (url === "/api/v1/tasks?limit=100") {
        return Promise.resolve(
          new Response(
            JSON.stringify({
              data: [
                {
                  id: "task_api_1",
                  title: "Persisted client review",
                  category: "current-client-care",
                  priority: "high",
                  status: "open"
                }
              ]
            }),
            { status: 200 }
          )
        );
      }

      if (url === "/api/v1/tasks/task_api_1/complete" && init?.method === "POST") {
        return Promise.resolve(
          new Response(
            JSON.stringify({
              data: {
                id: "task_api_1",
                title: "Persisted client review",
                category: "current-client-care",
                priority: "high",
                status: "completed"
              }
            }),
            { status: 200 }
          )
        );
      }

      return Promise.resolve(new Response(JSON.stringify({ data: [] }), { status: 200 }));
    });

    render(createElement(DashboardPage));

    const reviewTask = await screen.findByRole("button", {
      name: /mark persisted client review complete/i
    });
    fireEvent.click(reviewTask);

    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith("/api/v1/tasks/task_api_1/complete", { method: "POST" }));
    expect(
      screen.getByRole("button", {
        name: /mark persisted client review incomplete/i
      })
    ).toBeInTheDocument();
  });
});
