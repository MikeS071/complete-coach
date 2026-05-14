import { fireEvent, render, screen, within } from "@testing-library/react";
import { createElement } from "react";
import type React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DashboardShell } from "@/components/app-shell/dashboard-shell";
import { NotificationMenu } from "@/components/app-shell/notification-menu";
import { SidebarNav } from "@/components/app-shell/sidebar-nav";
import { TopSearch } from "@/components/app-shell/top-search";

const navigationMocks = vi.hoisted(() => ({
  pathname: "/",
  replace: vi.fn()
}));

const useSessionMock = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
  usePathname: () => navigationMocks.pathname,
  useRouter: () => ({
    replace: navigationMocks.replace
  })
}));

vi.mock("next-auth/react", () => ({
  SessionProvider: ({ children }: { children: React.ReactNode }) => createElement("div", null, children),
  useSession: () => useSessionMock()
}));

describe("app shell navigation", () => {
  beforeEach(() => {
    navigationMocks.pathname = "/";
    navigationMocks.replace.mockReset();
    useSessionMock.mockReturnValue({ data: null, status: "unauthenticated" });
  });

  it("renders primary and nested navigation links", () => {
    render(createElement(SidebarNav, { currentPath: "/training/exercises" }));
    const nav = screen.getByRole("navigation", { name: /primary navigation/i });

    expect(within(nav).getByRole("link", { name: /^dashboard$/i })).toHaveAttribute("href", "/");
    expect(within(nav).getByRole("button", { name: /^training$/i })).toHaveAttribute(
      "aria-expanded",
      "false"
    );
    expect(
      within(nav).queryByRole("link", { name: /^training programs$/i })
    ).not.toBeInTheDocument();

    fireEvent.click(within(nav).getByRole("button", { name: /expand training menu/i }));

    expect(within(nav).getByRole("link", { name: /^training programs$/i })).toHaveAttribute(
      "href",
      "/training/programs"
    );
    expect(within(nav).getByRole("link", { name: /^exercise database$/i })).toHaveAttribute(
      "href",
      "/training/exercises"
    );

    fireEvent.click(within(nav).getByRole("button", { name: /expand clients menu/i }));

    expect(within(nav).getByRole("link", { name: /^check-ins$/i })).toHaveAttribute(
      "href",
      "/clients/check-ins"
    );
  });

  it("marks the active route for nested navigation", () => {
    render(createElement(SidebarNav, { currentPath: "/clients/check-ins" }));
    const nav = screen.getByRole("navigation", { name: /primary navigation/i });
    const clientsButton = within(nav).getByRole("button", { name: /^clients$/i });

    expect(clientsButton).toHaveAttribute("aria-current", "page");
    expect(within(nav).queryByRole("link", { name: /^check-ins$/i })).not.toBeInTheDocument();

    fireEvent.click(within(nav).getByRole("button", { name: /expand clients menu/i }));

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
      name: /expand training menu/i
    });

    expect(trainingToggle).toHaveAttribute("aria-expanded", "false");
    expect(
      within(nav).queryByRole("link", { name: /^training programs$/i })
    ).not.toBeInTheDocument();

    fireEvent.click(trainingToggle);

    expect(trainingToggle).toHaveAttribute("aria-expanded", "true");
    expect(within(nav).getByRole("link", { name: /^training programs$/i })).toBeInTheDocument();

    fireEvent.click(trainingToggle);

    expect(trainingToggle).toHaveAttribute("aria-expanded", "false");
    expect(
      within(nav).queryByRole("link", { name: /^training programs$/i })
    ).not.toBeInTheDocument();
  });

  it("expands a nested menu group when the group title is clicked", () => {
    render(createElement(SidebarNav, { currentPath: "/" }));
    const nav = screen.getByRole("navigation", { name: /primary navigation/i });

    expect(within(nav).getByRole("button", { name: /expand training menu/i })).toHaveAttribute(
      "aria-expanded",
      "false"
    );

    fireEvent.click(within(nav).getByRole("button", { name: /^training$/i }));

    expect(within(nav).getByRole("button", { name: /collapse training menu/i })).toHaveAttribute(
      "aria-expanded",
      "true"
    );
    expect(within(nav).getByRole("link", { name: /^training programs$/i })).toBeInTheDocument();
  });

  it("keeps nested menu groups collapsed by default on active nested routes", () => {
    render(createElement(SidebarNav, { currentPath: "/nutrition/meal-plans" }));
    const nav = screen.getByRole("navigation", { name: /primary navigation/i });

    expect(within(nav).getByRole("button", { name: /expand nutrition menu/i })).toHaveAttribute(
      "aria-expanded",
      "false"
    );
    expect(within(nav).queryByRole("link", { name: /^meal plans$/i })).not.toBeInTheDocument();

    fireEvent.click(within(nav).getByRole("button", { name: /expand nutrition menu/i }));

    expect(within(nav).getByRole("link", { name: /^meal plans$/i })).toHaveAttribute(
      "aria-current",
      "page"
    );
  });
});

describe("dashboard shell auth boundary", () => {
  beforeEach(() => {
    navigationMocks.pathname = "/";
    navigationMocks.replace.mockReset();
    useSessionMock.mockReturnValue({ data: null, status: "unauthenticated" });
  });

  it("renders public routes without app navigation for signed-out users", () => {
    navigationMocks.pathname = "/sign-in";

    render(createElement(DashboardShell, null, createElement("h1", null, "Welcome back")));

    expect(screen.getByRole("heading", { name: /welcome back/i })).toBeInTheDocument();
    expect(screen.queryByRole("navigation", { name: /primary navigation/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("searchbox", { name: /search tasks/i })).not.toBeInTheDocument();
    expect(navigationMocks.replace).not.toHaveBeenCalled();
  });

  it("redirects signed-out users away from protected routes without app navigation", () => {
    navigationMocks.pathname = "/";

    render(createElement(DashboardShell, null, createElement("h1", null, "Dashboard")));

    expect(screen.getByText(/loading secure workspace/i)).toBeInTheDocument();
    expect(screen.queryByRole("navigation", { name: /primary navigation/i })).not.toBeInTheDocument();
    expect(navigationMocks.replace).toHaveBeenCalledWith("/sign-in");
  });

  it("renders full app navigation for authenticated users", () => {
    useSessionMock.mockReturnValue({
      data: {
        user: { id: "user_1", name: "Demo Coach", email: "coach@example.com" },
        activeOrganization: { name: "Complete Coach Demo", role: "owner" }
      },
      status: "authenticated"
    });

    render(createElement(DashboardShell, null, createElement("h1", null, "Dashboard")));

    expect(screen.getByRole("navigation", { name: /primary navigation/i })).toBeInTheDocument();
    expect(screen.getByRole("searchbox", { name: /search tasks/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /open account menu for demo coach/i }));
    expect(screen.getByText("Complete Coach Demo · owner")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Dashboard" })).toBeInTheDocument();
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
