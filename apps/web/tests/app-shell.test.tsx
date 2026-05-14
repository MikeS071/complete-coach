import { fireEvent, render, screen, within } from "@testing-library/react";
import { createElement } from "react";
import type React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DashboardShell } from "@/components/app-shell/dashboard-shell";
import { NotificationMenu } from "@/components/app-shell/notification-menu";
import { SidebarNav } from "@/components/app-shell/sidebar-nav";
import { TopSearch } from "@/components/app-shell/top-search";

const navigationMocks = vi.hoisted(() => ({
  pathname: "/",
  push: vi.fn(),
  replace: vi.fn()
}));

const useSessionMock = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
  usePathname: () => navigationMocks.pathname,
  useRouter: () => ({
    push: navigationMocks.push,
    replace: navigationMocks.replace
  })
}));

vi.mock("next-auth/react", () => ({
  SessionProvider: ({ children }: { children: React.ReactNode }) => createElement("div", null, children),
  useSession: () => useSessionMock()
}));

describe("app shell navigation", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  beforeEach(() => {
    navigationMocks.pathname = "/";
    navigationMocks.push.mockReset();
    navigationMocks.replace.mockReset();
    useSessionMock.mockReturnValue({ data: null, status: "unauthenticated" });
  });

  it("renders primary and nested navigation links", () => {
    render(createElement(SidebarNav, { currentPath: "/training/exercises" }));
    const nav = screen.getByRole("navigation", { name: /primary navigation/i });

    expect(within(nav).getByRole("link", { name: /^dashboard$/i })).toHaveAttribute("href", "/");
    expect(within(nav).getByRole("link", { name: /^training$/i })).toHaveAttribute(
      "href",
      "/training"
    );
    expect(within(nav).getByRole("link", { name: /^training$/i })).toHaveAttribute(
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
    const clientsLink = within(nav).getByRole("link", { name: /^clients$/i });

    expect(clientsLink).toHaveAttribute("aria-current", "page");
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

  it("links a nested group title to its summary page and expands the group on click", () => {
    render(createElement(SidebarNav, { currentPath: "/" }));
    const nav = screen.getByRole("navigation", { name: /primary navigation/i });

    expect(within(nav).getByRole("button", { name: /expand training menu/i })).toHaveAttribute(
      "aria-expanded",
      "false"
    );

    const trainingLink = within(nav).getByRole("link", { name: /^training$/i });
    trainingLink.addEventListener("click", (event) => {
      event.preventDefault();
    });
    fireEvent.click(trainingLink);

    expect(within(nav).getByRole("button", { name: /collapse training menu/i })).toHaveAttribute(
      "aria-expanded",
      "true"
    );
    expect(within(nav).getByRole("link", { name: /^training programs$/i })).toBeInTheDocument();
  });

  it("keeps a group expanded on its summary route", () => {
    render(createElement(SidebarNav, { currentPath: "/training" }));
    const nav = screen.getByRole("navigation", { name: /primary navigation/i });

    expect(within(nav).getByRole("link", { name: /^training$/i })).toHaveAttribute(
      "aria-current",
      "page"
    );
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

  it("creates a new client from the sidebar quick action", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          data: {
            id: "client_sidebar_1",
            name: "Sidebar Client",
            packageName: "Starter Coaching",
            compliance: 0,
            checkInDay: "Friday",
            latestCheckIn: "Not recorded",
            status: "new",
            startDate: "May 14, 2026",
            initials: "SC",
            avatarColor: "bg-slate-900"
          }
        }),
        { status: 201 }
      )
    );

    render(createElement(SidebarNav, { currentPath: "/" }));

    fireEvent.click(screen.getByRole("button", { name: "+ New Client" }));
    fireEvent.change(screen.getByLabelText("First name"), { target: { value: "Sidebar" } });
    fireEvent.change(screen.getByLabelText("Last name"), { target: { value: "Client" } });
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "sidebar@example.com" } });
    fireEvent.change(screen.getByLabelText("Package"), { target: { value: "Starter Coaching" } });
    fireEvent.change(screen.getByLabelText("Check-in day"), { target: { value: "Friday" } });
    fireEvent.click(screen.getByRole("button", { name: "Save client" }));

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/clients",
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining("sidebar@example.com")
      })
    );
    expect(await screen.findByRole("navigation", { name: /primary navigation/i })).toBeInTheDocument();
    expect(navigationMocks.push).toHaveBeenCalledWith("/clients/client_sidebar_1");
  });
});

describe("dashboard shell auth boundary", () => {
  beforeEach(() => {
    navigationMocks.pathname = "/";
    navigationMocks.push.mockReset();
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
