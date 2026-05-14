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
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
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
    );

    render(createElement(ClientProfilePage, { clientId: "client_api_1" }));

    expect(await screen.findByRole("heading", { level: 1, name: "API Client" })).toBeInTheDocument();
    expect(screen.getByText("Persisted Package")).toBeInTheDocument();
    expect(screen.getByText("Profile details are ready for persistence-backed coaching notes.")).toBeInTheDocument();
  });

  it("switches profile tabs locally", () => {
    render(createElement(ClientProfilePage, { clientId: "1" }));

    fireEvent.click(screen.getByRole("tab", { name: "Training" }));

    expect(screen.getByRole("tabpanel", { name: "Training" })).toHaveTextContent("Weekly Training Schedule");
    expect(screen.getByText("Upper Power")).toBeInTheDocument();
  });
});
