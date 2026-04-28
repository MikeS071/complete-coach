import { fireEvent, render, screen, within } from "@testing-library/react";
import { createElement } from "react";
import { describe, expect, it } from "vitest";
import { FormsPage } from "@/components/forms/forms-page";

describe("FormsPage", () => {
  it("opens the builder from a template", () => {
    render(createElement(FormsPage));

    expect(screen.getByRole("heading", { level: 1, name: "Create a New Form" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /use check-in forms template/i }));

    expect(screen.getByRole("heading", { level: 1, name: "Form Builder" })).toBeInTheDocument();
    expect(screen.getByText("Check-in Forms")).toBeInTheDocument();
  });

  it("adds, removes, and reorders form fields locally", () => {
    render(createElement(FormsPage));

    fireEvent.click(screen.getByRole("button", { name: /start from scratch/i }));

    const preview = screen.getByRole("region", { name: "Form preview" });
    expect(within(preview).getByText("Full Legal Name")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Add Email field" }));
    expect(within(preview).getByText("New email field")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Move New email field up" }));
    const fieldsAfterMove = within(preview).getAllByTestId("form-field");
    expect(within(fieldsAfterMove[1]).getByText("New email field")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Remove New email field" }));
    expect(within(preview).queryByText("New email field")).not.toBeInTheDocument();
  });

  it("returns from builder to management", () => {
    render(createElement(FormsPage));

    fireEvent.click(screen.getByRole("button", { name: /start from scratch/i }));
    fireEvent.click(screen.getByRole("button", { name: "Back to forms" }));

    expect(screen.getByRole("heading", { level: 1, name: "Create a New Form" })).toBeInTheDocument();
  });
});
