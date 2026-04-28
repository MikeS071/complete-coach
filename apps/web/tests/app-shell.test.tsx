import { fireEvent, render, screen, within } from "@testing-library/react";
import { createElement } from "react";
import { describe, expect, it } from "vitest";
import { NotificationMenu } from "@/components/app-shell/notification-menu";
import { SidebarNav } from "@/components/app-shell/sidebar-nav";
import { TopSearch } from "@/components/app-shell/top-search";

describe("app shell navigation", () => {
  it("renders primary and nested navigation links", () => {
    render(createElement(SidebarNav, { currentPath: "/training/exercises" }));
    const nav = screen.getByRole("navigation", { name: /primary navigation/i });

    expect(within(nav).getByRole("link", { name: /^dashboard$/i })).toHaveAttribute("href", "/");
    expect(within(nav).getByRole("link", { name: /^training programs$/i })).toHaveAttribute(
      "href",
      "/training/programs"
    );
    expect(within(nav).getByRole("link", { name: /^exercise database$/i })).toHaveAttribute(
      "href",
      "/training/exercises"
    );
    expect(within(nav).getByRole("link", { name: /^check-ins$/i })).toHaveAttribute(
      "href",
      "/clients/check-ins"
    );
  });

  it("marks the active route for nested navigation", () => {
    render(createElement(SidebarNav, { currentPath: "/clients/check-ins" }));
    const nav = screen.getByRole("navigation", { name: /primary navigation/i });
    const clientLinks = within(nav).getAllByRole("link", { name: /^clients$/i });

    expect(clientLinks.some((link) => link.getAttribute("aria-current") === "page")).toBe(true);
    expect(within(nav).getByRole("link", { name: /^check-ins$/i })).toHaveAttribute(
      "aria-current",
      "page"
    );
    expect(within(nav).getByRole("link", { name: /^dashboard$/i })).not.toHaveAttribute(
      "aria-current"
    );
  });

  it("collapses and expands nested menu groups", () => {
    render(createElement(SidebarNav, { currentPath: "/" }));
    const nav = screen.getByRole("navigation", { name: /primary navigation/i });
    const trainingToggle = within(nav).getByRole("button", {
      name: /collapse training menu/i
    });

    expect(trainingToggle).toHaveAttribute("aria-expanded", "true");
    expect(within(nav).getByRole("link", { name: /^training programs$/i })).toBeInTheDocument();

    fireEvent.click(trainingToggle);

    expect(trainingToggle).toHaveAttribute("aria-expanded", "false");
    expect(
      within(nav).queryByRole("link", { name: /^training programs$/i })
    ).not.toBeInTheDocument();

    fireEvent.click(trainingToggle);

    expect(trainingToggle).toHaveAttribute("aria-expanded", "true");
    expect(within(nav).getByRole("link", { name: /^training programs$/i })).toBeInTheDocument();
  });

  it("keeps the active nested group expanded by default", () => {
    render(createElement(SidebarNav, { currentPath: "/nutrition/meal-plans" }));
    const nav = screen.getByRole("navigation", { name: /primary navigation/i });

    expect(
      within(nav).getByRole("button", { name: /collapse nutrition menu/i })
    ).toHaveAttribute("aria-expanded", "true");
    expect(within(nav).getByRole("link", { name: /^meal plans$/i })).toHaveAttribute(
      "aria-current",
      "page"
    );
  });
});

describe("topbar controls", () => {
  it("renders a globally searchable input", () => {
    render(createElement(TopSearch));

    expect(
      screen.getByRole("searchbox", { name: /search tasks, clients, or pipeline/i })
    ).toBeInTheDocument();
  });
});

describe("notifications", () => {
  it("shows unread count and can mark all notifications as read", () => {
    render(createElement(NotificationMenu));

    const trigger = screen.getByRole("button", { name: /notifications/i });
    expect(trigger).toHaveTextContent("3");

    fireEvent.click(trigger);
    const menu = screen.getByRole("region", { name: /notifications/i });

    expect(within(menu).getByText("New Check-In Submitted")).toBeInTheDocument();

    fireEvent.click(within(menu).getByRole("button", { name: /mark all as read/i }));

    expect(screen.getByRole("button", { name: /notifications/i })).toHaveTextContent("0");
  });
});
