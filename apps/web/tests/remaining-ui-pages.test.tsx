import { fireEvent, render, screen, within } from "@testing-library/react";
import { createElement } from "react";
import { describe, expect, it } from "vitest";
import AddResourceRoute from "@/app/education/add/page";
import EducationRoute from "@/app/education/page";
import MessagesRoute from "@/app/messages/page";
import PackagesRoute from "@/app/packages/page";
import SocialMediaRoute from "@/app/social-media/page";
import SupplementDatabaseRoute from "@/app/supplementation/database/page";
import SupplementPlansRoute from "@/app/supplementation/plans/page";
import SupplementationRoute from "@/app/supplementation/page";
import TeamManagementRoute from "@/app/team-management/page";
import { MessagesPage } from "@/components/messages/messages-page";
import { SupplementDatabasePage } from "@/components/supplementation/supplement-database-page";
import { SupplementPlansPage } from "@/components/supplementation/supplement-plans-page";

const routeSmokeCases = [
  ["education", EducationRoute, "Educational Vault"],
  ["education add", AddResourceRoute, "Upload New Resource"],
  ["supplementation", SupplementationRoute, "Supplementation"],
  ["supplement plans", SupplementPlansRoute, "Supplementation Hub"],
  ["supplement database", SupplementDatabaseRoute, "Supplementation Library"],
  ["messages", MessagesRoute, "Messages"],
  ["packages", PackagesRoute, "Packages & Pricing"],
  ["team management", TeamManagementRoute, "Team Management"],
  ["social media", SocialMediaRoute, "Social Media Hub"]
] as const;

describe("Ticket 009 route smoke", () => {
  it.each(routeSmokeCases)("renders the %s route", (_name, RouteComponent, heading) => {
    render(createElement(RouteComponent));

    expect(screen.getByRole("heading", { level: 1, name: heading })).toBeInTheDocument();
  });
});

describe("MessagesPage", () => {
  it("selects conversations and sends a local message", () => {
    render(createElement(MessagesPage));

    expect(screen.getByRole("heading", { level: 2, name: "Sarah Johnson" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Open conversation with Marcus Chen/i }));

    const thread = screen.getByRole("log", { name: "Conversation with Marcus Chen" });
    expect(within(thread).getByText("Can we reschedule tomorrow's session?")).toBeInTheDocument();

    fireEvent.change(screen.getByRole("textbox", { name: /type a message/i }), {
      target: { value: "Tomorrow at 3 PM works." }
    });
    fireEvent.click(screen.getByRole("button", { name: "Send message" }));

    expect(within(thread).getByText("Tomorrow at 3 PM works.")).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: /type a message/i })).toHaveValue("");
  });

  it("filters conversations by search query", () => {
    render(createElement(MessagesPage));

    fireEvent.change(screen.getByRole("searchbox", { name: /search conversations/i }), {
      target: { value: "emma" }
    });

    expect(screen.getByRole("button", { name: /Open conversation with Emma Rodriguez/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Open conversation with Sarah Johnson/i })).not.toBeInTheDocument();
  });
});

describe("SupplementDatabasePage", () => {
  it("opens the new protocol panel and creates a local supplement", () => {
    render(createElement(SupplementDatabasePage));

    fireEvent.click(screen.getByRole("button", { name: "New Entry" }));

    expect(screen.getByRole("dialog", { name: "New Protocol" })).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Supplement Name"), {
      target: { value: "Vitamin D3" }
    });
    fireEvent.click(screen.getByRole("button", { name: "Morning" }));
    fireEvent.change(screen.getByLabelText("Standard Dosage"), {
      target: { value: "5000 IU" }
    });
    fireEvent.click(screen.getByRole("button", { name: "Create Protocol" }));

    expect(screen.queryByRole("dialog", { name: "New Protocol" })).not.toBeInTheDocument();
    expect(screen.getByText("Vitamin D3")).toBeInTheDocument();
    expect(screen.getByText("5000 IU")).toBeInTheDocument();
  });

  it("searches supplements by category and name", () => {
    render(createElement(SupplementDatabasePage));

    fireEvent.change(screen.getByRole("searchbox", { name: /search supplements/i }), {
      target: { value: "evening" }
    });

    expect(screen.getByText("Magnesium Glycinate")).toBeInTheDocument();
    expect(screen.queryByText("Creatine Monohydrate")).not.toBeInTheDocument();
  });
});

describe("SupplementPlansPage", () => {
  it("switches between active protocols and protocol library", () => {
    render(createElement(SupplementPlansPage));

    expect(screen.getByText("Alex Rivera")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: "Protocol Library" }));

    expect(screen.getByRole("tabpanel", { name: "Protocol Library" })).toHaveTextContent("Creatine Monohydrate");
    expect(screen.queryByText("Alex Rivera")).not.toBeInTheDocument();
  });
});
