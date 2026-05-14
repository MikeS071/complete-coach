import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { createElement } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ClientsPage } from "@/components/clients/clients-page";

describe("ClientsPage", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders roster stats and fixture-backed clients", () => {
    render(createElement(ClientsPage));

    expect(screen.getByRole("heading", { level: 1, name: "Client Roster" })).toBeInTheDocument();
    expect(screen.getByText("Total Clients")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /view Marcus Rodriguez profile/i })).toHaveAttribute(
      "href",
      "/clients/1"
    );
    expect(screen.getByRole("link", { name: /view Emma Thompson profile/i })).toBeInTheDocument();
  });

  it("searches clients by name", () => {
    render(createElement(ClientsPage));

    fireEvent.change(screen.getByRole("searchbox", { name: /search clients/i }), {
      target: { value: "Emma" }
    });

    expect(screen.getByRole("link", { name: /view Emma Thompson profile/i })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /view Marcus Rodriguez profile/i })).not.toBeInTheDocument();
  });

  it("filters by status and check-in day", () => {
    render(createElement(ClientsPage));

    fireEvent.click(screen.getByRole("button", { name: "New" }));

    expect(screen.getByRole("link", { name: /view Sarah Martinez profile/i })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /view Emma Thompson profile/i })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /open client filters/i }));
    fireEvent.click(screen.getByRole("menuitemcheckbox", { name: "Monday" }));

    expect(screen.getByRole("link", { name: /view Ashley Davis profile/i })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /view Sarah Martinez profile/i })).not.toBeInTheDocument();
  });

  it("sorts the visible roster A to Z", () => {
    render(createElement(ClientsPage));

    fireEvent.click(screen.getByRole("button", { name: /open client filters/i }));
    fireEvent.click(screen.getByRole("menuitemcheckbox", { name: "Sort A-Z" }));

    const rows = screen.getAllByTestId("client-row");

    expect(within(rows[0]).getByText("Ashley Davis")).toBeInTheDocument();
    expect(within(rows[rows.length - 1]).getByText("Sarah Martinez")).toBeInTheDocument();
  });

  it("loads API-backed clients when the persistence API is available", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          data: [
            {
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
          ]
        }),
        { status: 200 }
      )
    );

    render(createElement(ClientsPage));

    await waitFor(() => {
      expect(screen.getByRole("link", { name: /view API Client profile/i })).toHaveAttribute(
        "href",
        "/clients/client_api_1"
      );
    });
  });
});
