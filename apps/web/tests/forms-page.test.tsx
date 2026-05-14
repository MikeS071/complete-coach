import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { createElement } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { FormsPage } from "@/components/forms/forms-page";

describe("FormsPage", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

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

  it("loads API-backed forms when the persistence API is available", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          data: [
            {
              id: "form_api_1",
              name: "Persisted Weekly Check-In",
              description: "Persisted description",
              type: "check-in",
              status: "published",
              currentVersionId: "version_1",
              updatedAt: "2026-05-14T00:00:00.000Z",
              createdAt: "2026-05-14T00:00:00.000Z"
            }
          ]
        }),
        { status: 200 }
      )
    );

    render(createElement(FormsPage));

    expect(await screen.findByText("Persisted Weekly Check-In")).toBeInTheDocument();
    expect(screen.queryByText("Weekly Performance Log")).not.toBeInTheDocument();
  });

  it("keeps fixture forms when the persistence API is unavailable", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({ error: {} }), { status: 503 }));

    render(createElement(FormsPage));

    expect(await screen.findByText("Weekly Performance Log")).toBeInTheDocument();
    expect(screen.getByText(/showing local sample forms/i)).toBeInTheDocument();
  });

  it("shows an empty persisted state when the forms API is available without records", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({ data: [] }), { status: 200 }));

    render(createElement(FormsPage));

    expect(await screen.findByText(/no persisted forms yet/i)).toBeInTheDocument();
    expect(screen.queryByText("Weekly Performance Log")).not.toBeInTheDocument();
  });

  it("saves a draft form and immutable version through the persistence API", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(new Response(JSON.stringify({ data: [] }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ data: [] }), { status: 200 }))
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            data: {
              id: "form_created_1",
              name: "Custom Intake",
              description: "Custom description",
              type: "intake",
              status: "draft",
              currentVersionId: null,
              createdAt: "2026-05-14T00:00:00.000Z",
              updatedAt: "2026-05-14T00:00:00.000Z"
            }
          }),
          { status: 201 }
        )
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            data: {
              id: "version_1",
              formId: "form_created_1",
              versionNumber: 1,
              schema: { title: "Custom Intake", description: "Custom description", fields: [] },
              ui: { primaryColor: "#6366f1" },
              publishedAt: null,
              createdAt: "2026-05-14T00:00:00.000Z"
            }
          }),
          { status: 201 }
        )
      );

    render(createElement(FormsPage));

    fireEvent.click(screen.getByRole("button", { name: /start from scratch/i }));
    fireEvent.change(screen.getByLabelText("Form title"), { target: { value: "Custom Intake" } });
    fireEvent.change(screen.getByLabelText("Form description"), { target: { value: "Custom description" } });
    fireEvent.click(screen.getByRole("button", { name: "Save Changes" }));

    expect(await screen.findByText("Draft saved to persistence API.")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/forms",
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining("Custom Intake")
      })
    );
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/forms/form_created_1/versions",
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining("Full Legal Name")
      })
    );
  });

  it("updates an existing persisted form before saving a new version", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            data: [
              {
                id: "form_api_1",
                name: "Persisted Weekly Check-In",
                description: "Persisted description",
                type: "check-in",
                status: "draft",
                currentVersionId: null,
                updatedAt: "not-a-date",
                createdAt: "2026-05-14T00:00:00.000Z"
              }
            ]
          }),
          { status: 200 }
        )
      )
      .mockResolvedValueOnce(new Response(JSON.stringify({ data: [] }), { status: 200 }))
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            data: {
              id: "form_api_1",
              name: "Updated Persisted Form",
              description: "Persisted description",
              type: "check-in",
              status: "draft",
              currentVersionId: null,
              updatedAt: "2026-05-14T00:00:00.000Z",
              createdAt: "2026-05-14T00:00:00.000Z"
            }
          }),
          { status: 200 }
        )
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            data: {
              id: "version_2",
              formId: "form_api_1",
              versionNumber: 2,
              schema: { title: "Updated Persisted Form", fields: [] },
              ui: {},
              publishedAt: null,
              createdAt: "2026-05-14T00:00:00.000Z"
            }
          }),
          { status: 201 }
        )
      );

    render(createElement(FormsPage));

    expect(await screen.findByText("Persisted Weekly Check-In")).toBeInTheDocument();
    expect(screen.getByText(/recently/i)).toBeInTheDocument();

    fireEvent.click(screen.getByText("Persisted Weekly Check-In"));
    fireEvent.change(screen.getByLabelText("Form title"), { target: { value: "Updated Persisted Form" } });
    fireEvent.click(screen.getByRole("button", { name: "Save Changes" }));

    expect(await screen.findByText("Draft saved to persistence API.")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/forms/form_api_1",
      expect.objectContaining({
        method: "PATCH",
        body: expect.stringContaining("Updated Persisted Form")
      })
    );
  });

  it("shows a save error when form persistence fails", async () => {
    vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(new Response(JSON.stringify({ data: [] }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ data: [] }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ error: {} }), { status: 503 }));

    render(createElement(FormsPage));

    fireEvent.click(screen.getByRole("button", { name: /start from scratch/i }));
    fireEvent.click(screen.getByRole("button", { name: "Save Changes" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Form could not be saved");
  });

  it("publishes and assigns a form to a client", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(new Response(JSON.stringify({ data: [] }), { status: 200 }))
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            data: [
              {
                id: "client_1",
                name: "API Client",
                packageName: "Coaching",
                compliance: 90,
                checkInDay: "Monday",
                latestCheckIn: "May 1, 2026",
                status: "active",
                startDate: "May 1, 2026",
                initials: "AC",
                avatarColor: "bg-slate-900"
              }
            ]
          }),
          { status: 200 }
        )
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            data: {
              id: "form_created_1",
              name: "Custom Intake",
              description: "Custom description",
              type: "intake",
              status: "draft",
              currentVersionId: null,
              createdAt: "2026-05-14T00:00:00.000Z",
              updatedAt: "2026-05-14T00:00:00.000Z"
            }
          }),
          { status: 201 }
        )
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            data: {
              id: "version_1",
              formId: "form_created_1",
              versionNumber: 1,
              schema: { title: "Custom Intake", fields: [] },
              ui: {},
              publishedAt: null,
              createdAt: "2026-05-14T00:00:00.000Z"
            }
          }),
          { status: 201 }
        )
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            data: {
              id: "form_created_1",
              name: "Custom Intake",
              description: "Custom description",
              type: "intake",
              status: "published",
              currentVersionId: "version_1",
              createdAt: "2026-05-14T00:00:00.000Z",
              updatedAt: "2026-05-14T00:00:00.000Z"
            }
          }),
          { status: 200 }
        )
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            data: {
              id: "assignment_1",
              formId: "form_created_1",
              formVersionId: "version_1",
              clientId: "client_1",
              status: "assigned",
              dueAt: null,
              completedAt: null,
              createdAt: "2026-05-14T00:00:00.000Z"
            }
          }),
          { status: 201 }
        )
      );

    render(createElement(FormsPage));

    fireEvent.click(screen.getByRole("button", { name: /start from scratch/i }));
    fireEvent.change(screen.getByLabelText("Form title"), { target: { value: "Custom Intake" } });
    fireEvent.click(screen.getByRole("button", { name: "Publish Form" }));

    expect(await screen.findByText("Form published and ready for assignment.")).toBeInTheDocument();

    await waitFor(() => expect(screen.getByLabelText("Assign to client")).toHaveValue("client_1"));
    fireEvent.click(screen.getByRole("button", { name: "Assign Form" }));

    expect(await screen.findByText("Form assigned to selected client.")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/forms/form_created_1/publish",
      expect.objectContaining({ method: "POST" })
    );
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/forms/form_created_1/assignments",
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining("client_1")
      })
    );
  });
});
