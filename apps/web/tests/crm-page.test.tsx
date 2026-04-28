import { fireEvent, render, screen, within } from "@testing-library/react";
import { createElement } from "react";
import { describe, expect, it } from "vitest";
import { CRMPage } from "@/components/crm/crm-page";

describe("CRMPage", () => {
  it("renders CRM pipeline stages and lead cards", () => {
    render(createElement(CRMPage));

    expect(
      screen.getByRole("heading", { level: 1, name: "Client Relationship Management" })
    ).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Initial Contact" })).toHaveTextContent("Jessica Martinez");
    expect(screen.getByRole("region", { name: "Consultation Scheduled" })).toHaveTextContent("Michael Chen");
  });

  it("moves a lead to another stage through the accessible stage action", () => {
    render(createElement(CRMPage));

    const initialContact = screen.getByRole("region", { name: "Initial Contact" });
    const proposal = screen.getByRole("region", { name: "Proposal Sent" });

    expect(within(initialContact).getByText("Jessica Martinez")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Move Jessica Martinez to Proposal Sent" }));

    expect(within(proposal).getByText("Jessica Martinez")).toBeInTheDocument();
    expect(within(initialContact).queryByText("Jessica Martinez")).not.toBeInTheDocument();
  });
});
