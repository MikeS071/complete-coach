import { fireEvent, render, screen } from "@testing-library/react";
import { createElement } from "react";
import { describe, expect, it } from "vitest";
import { ClientProfilePage } from "@/components/clients/client-profile-page";

describe("ClientProfilePage", () => {
  it("renders a client profile by id", () => {
    render(createElement(ClientProfilePage, { clientId: "1" }));

    expect(screen.getByRole("heading", { level: 1, name: "Marcus Rodriguez" })).toBeInTheDocument();
    expect(screen.getByText("Hypertrophy II")).toBeInTheDocument();
    expect(screen.getByText("88.4")).toBeInTheDocument();
    expect(screen.getByText("Recovery Score")).toBeInTheDocument();
  });

  it("shows a deterministic fallback for an unknown client id", () => {
    render(createElement(ClientProfilePage, { clientId: "missing" }));

    expect(screen.getByRole("heading", { level: 1, name: "Client Not Found" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to clients" })).toHaveAttribute("href", "/clients");
  });

  it("switches profile tabs locally", () => {
    render(createElement(ClientProfilePage, { clientId: "1" }));

    fireEvent.click(screen.getByRole("tab", { name: "Training" }));

    expect(screen.getByRole("tabpanel", { name: "Training" })).toHaveTextContent("Weekly Training Schedule");
    expect(screen.getByText("Upper Power")).toBeInTheDocument();
  });
});
