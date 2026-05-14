import { fireEvent, render, screen } from "@testing-library/react";
import { createElement } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ClientProfilePage } from "@/components/clients/client-profile-page";

describe("ClientProfilePage", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders a client profile by id", () => {
    render(createElement(ClientProfilePage, { clientId: "1" }));

    expect(screen.getByRole("heading", { level: 1, name: "Marcus Rodriguez" })).toBeInTheDocument();
    expect(screen.getByText("Hypertrophy II")).toBeInTheDocument();
    expect(screen.getByText("88.4")).toBeInTheDocument();
    expect(screen.getByText("Recovery Score")).toBeInTheDocument();
  });

  it("shows a deterministic fallback for an unknown client id", async () => {
    render(createElement(ClientProfilePage, { clientId: "missing" }));

    expect(
      await screen.findByRole("heading", { level: 1, name: "Client Not Found" })
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to clients" })).toHaveAttribute(
      "href",
      "/clients"
    );
  });

  it("loads an API-backed profile when the client is not in fixtures", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            data: {
              id: "client_api_1",
              name: "API Client",
              packageName: "Persisted Package",
              compliance: 91,
              checkInDay: "Wednesday",
              latestCheckIn: "May 1, 2026",
              status: "active",
              startDate: "Apr 1, 2026",
              initials: "AC",
              avatarColor: "bg-slate-900"
            }
          }),
          { status: 200 }
        )
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            data: {
              bio: "Persisted profile bio",
              goals: ["Strength rebuild"],
              dateOfBirth: "1990-05-14T00:00:00.000Z"
            }
          }),
          { status: 200 }
        )
      );

    render(createElement(ClientProfilePage, { clientId: "client_api_1" }));

    expect(await screen.findByRole("heading", { level: 1, name: "API Client" })).toBeInTheDocument();
    expect(screen.getByText("Persisted Package")).toBeInTheDocument();
    expect(screen.getByText("Persisted profile bio")).toBeInTheDocument();
    expect(screen.getByText("Strength rebuild")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith("/api/v1/clients/client_api_1/profile");
  });

  it("uses safe defaults when the persisted profile is unavailable", async () => {
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            data: {
              id: "client_api_2",
              name: "API Client Two",
              packageName: "Persisted Package",
              compliance: 78,
              checkInDay: "Thursday",
              latestCheckIn: "May 2, 2026",
              status: "paused",
              startDate: "Apr 2, 2026",
              initials: "AT",
              avatarColor: "bg-slate-900"
            }
          }),
          { status: 200 }
        )
      )
      .mockResolvedValueOnce(new Response(null, { status: 403 }));

    render(createElement(ClientProfilePage, { clientId: "client_api_2" }));

    expect(await screen.findByRole("heading", { level: 1, name: "API Client Two" })).toBeInTheDocument();
    expect(screen.getByText("Profile details are ready for persistence-backed coaching notes.")).toBeInTheDocument();
    expect(screen.getByText("Unassigned")).toBeInTheDocument();
    expect(screen.getAllByText("0").length).toBeGreaterThan(0);
  });

  it("normalizes incomplete persisted profile fields safely", async () => {
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            data: {
              id: "client_api_3",
              name: "API Client Three",
              packageName: "Persisted Package",
              compliance: 82,
              checkInDay: "Monday",
              latestCheckIn: "May 3, 2026",
              status: "active",
              startDate: "Apr 3, 2026",
              initials: "AH",
              avatarColor: "bg-slate-900"
            }
          }),
          { status: 200 }
        )
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            data: {
              bio: null,
              goals: [],
              dateOfBirth: "1990-12-31T00:00:00.000Z"
            }
          }),
          { status: 200 }
        )
      );

    render(createElement(ClientProfilePage, { clientId: "client_api_3" }));

    expect(await screen.findByRole("heading", { level: 1, name: "API Client Three" })).toBeInTheDocument();
    expect(screen.getByText("Profile details are ready for persistence-backed coaching notes.")).toBeInTheDocument();
    expect(screen.getByText("Unassigned")).toBeInTheDocument();
  });

  it("switches profile tabs locally", () => {
    render(createElement(ClientProfilePage, { clientId: "1" }));

    fireEvent.click(screen.getByRole("tab", { name: "Training" }));

    expect(screen.getByRole("tabpanel", { name: "Training" })).toHaveTextContent("Weekly Training Schedule");
    expect(screen.getByText("Upper Power")).toBeInTheDocument();
  });
});
