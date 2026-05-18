import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { createElement } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
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

afterEach(() => {
  vi.restoreAllMocks();
});

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
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("API unavailable"));
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
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("API unavailable"));
    render(createElement(MessagesPage));

    fireEvent.change(screen.getByRole("searchbox", { name: /search conversations/i }), {
      target: { value: "emma" }
    });

    expect(screen.getByRole("button", { name: /Open conversation with Emma Rodriguez/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Open conversation with Sarah Johnson/i })).not.toBeInTheDocument();
  });

  it("loads persisted conversations and messages when APIs are available", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation((input) => {
      const url = String(input);

      if (url.startsWith("/api/v1/conversations?")) {
        return Promise.resolve(
          new Response(
            JSON.stringify({
              data: [
                {
                  id: "conversation_api",
                  clientName: "Persisted Messaging Client",
                  title: "Persisted Messaging Client",
                  latestMessage: {
                    id: "message_latest",
                    senderType: "client",
                    body: "API-backed latest message",
                    createdAt: "2026-05-18T09:15:00.000Z"
                  },
                  updatedAt: "2026-05-18T09:15:00.000Z"
                }
              ]
            }),
            { status: 200 }
          )
        );
      }

      if (url === "/api/v1/conversations/conversation_api/messages?limit=100") {
        return Promise.resolve(
          new Response(
            JSON.stringify({
              data: [
                {
                  id: "message_api_1",
                  senderType: "client",
                  body: "Persisted check-in question",
                  createdAt: "2026-05-18T09:10:00.000Z"
                },
                {
                  id: "message_api_2",
                  senderType: "user",
                  body: "Persisted coach response",
                  createdAt: "2026-05-18T09:12:00.000Z"
                }
              ]
            }),
            { status: 200 }
          )
        );
      }

      return Promise.resolve(new Response(JSON.stringify({ data: [] }), { status: 200 }));
    });

    render(createElement(MessagesPage));

    expect(await screen.findByRole("button", { name: /Open conversation with Persisted Messaging Client/i })).toBeInTheDocument();
    const thread = await screen.findByRole("log", { name: "Conversation with Persisted Messaging Client" });

    expect(await within(thread).findByText("Persisted check-in question")).toBeInTheDocument();
    expect(await within(thread).findByText("Persisted coach response")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Open conversation with Sarah Johnson/i })).not.toBeInTheDocument();
  });

  it("sends messages through the persistence API when available", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation((input, init) => {
      const url = String(input);

      if (url.startsWith("/api/v1/conversations?")) {
        return Promise.resolve(
          new Response(
            JSON.stringify({
              data: [
                {
                  id: "conversation_api",
                  clientName: "Persisted Messaging Client",
                  title: null,
                  latestMessage: null,
                  updatedAt: "2026-05-18T09:15:00.000Z"
                }
              ]
            }),
            { status: 200 }
          )
        );
      }

      if (url === "/api/v1/conversations/conversation_api/messages?limit=100") {
        return Promise.resolve(new Response(JSON.stringify({ data: [] }), { status: 200 }));
      }

      if (url === "/api/v1/conversations/conversation_api/messages" && init?.method === "POST") {
        return Promise.resolve(
          new Response(
            JSON.stringify({
              data: {
                id: "message_created",
                senderType: "user",
                body: "Persisted outbound message",
                createdAt: "2026-05-18T09:20:00.000Z"
              }
            }),
            { status: 201 }
          )
        );
      }

      return Promise.resolve(new Response(JSON.stringify({ data: [] }), { status: 200 }));
    });

    render(createElement(MessagesPage));

    const thread = await screen.findByRole("log", { name: "Conversation with Persisted Messaging Client" });
    fireEvent.change(screen.getByRole("textbox", { name: /type a message/i }), {
      target: { value: "Persisted outbound message" }
    });
    fireEvent.click(screen.getByRole("button", { name: "Send message" }));

    expect(await within(thread).findByText("Persisted outbound message")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/conversations/conversation_api/messages",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ body: "Persisted outbound message" })
      })
    );
    await waitFor(() => expect(screen.getByRole("textbox", { name: /type a message/i })).toHaveValue(""));
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
