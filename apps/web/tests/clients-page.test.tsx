import { fireEvent, render, screen, within } from "@testing-library/react";
import { createElement } from "react";
import { describe, expect, it } from "vitest";
import { ClientsPage } from "@/components/clients/clients-page";

describe("ClientsPage", () => {
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
});
