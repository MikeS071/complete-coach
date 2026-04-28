import { fireEvent, render, screen, within } from "@testing-library/react";
import { createElement } from "react";
import { describe, expect, it } from "vitest";
import { CheckInManagementPage } from "@/components/check-ins/check-in-management-page";

describe("CheckInManagementPage", () => {
  it("renders pending check-ins with timing status", () => {
    render(createElement(CheckInManagementPage));

    expect(screen.getByRole("heading", { level: 1, name: "Check In Review Center" })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Check-in list" })).toHaveTextContent("Sarah Williams");
    expect(screen.getAllByText("On Time").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Late").length).toBeGreaterThan(0);
  });

  it("switches to completed check-ins", () => {
    render(createElement(CheckInManagementPage));

    fireEvent.click(screen.getByRole("tab", { name: "Completed" }));

    const list = screen.getByRole("region", { name: "Check-in list" });
    expect(within(list).getByText("Jordan Smith")).toBeInTheDocument();
    expect(within(list).queryByText("Sarah Williams")).not.toBeInTheDocument();
  });

  it("sorts check-ins by name", () => {
    render(createElement(CheckInManagementPage));

    fireEvent.click(screen.getByRole("button", { name: /sort check-ins/i }));
    fireEvent.click(screen.getByRole("menuitem", { name: "By Name" }));

    const rows = screen.getAllByTestId("check-in-row");
    expect(within(rows[0]).getByText("David Thompson")).toBeInTheDocument();
    expect(within(rows[rows.length - 1]).getByText("Sarah Williams")).toBeInTheDocument();
  });
});
