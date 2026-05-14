import { mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import { expect, test, type Page } from "@playwright/test";

test.describe.configure({ mode: "serial" });

const routeCases = [
  { path: "/", heading: "Coach Operations Dashboard" },
  { path: "/training", heading: "Training Programs" },
  { path: "/training/programs", heading: "Program Library" },
  { path: "/training/exercises", heading: "The Movement Vault" },
  { path: "/training/exercises/add", heading: "Add New Exercise" },
  { path: "/nutrition", heading: "Nutrition Plans" },
  { path: "/nutrition/meal-plans", heading: "Meal Plan Library" },
  { path: "/nutrition/food-database", heading: "Food Database" },
  { path: "/education", heading: "Educational Vault" },
  { path: "/education/add", heading: "Upload New Resource" },
  { path: "/supplementation", heading: "Supplementation" },
  { path: "/supplementation/plans", heading: "Supplementation Hub" },
  { path: "/supplementation/database", heading: "Supplementation Library" },
  { path: "/clients", heading: "Client Roster" },
  { path: "/clients/1", heading: "Marcus Rodriguez" },
  { path: "/clients/crm", heading: "Client Relationship Management" },
  { path: "/clients/check-ins", heading: "Check In Review Center" },
  { path: "/forms", heading: "Create a New Form" },
  { path: "/messages", heading: "Messages" },
  { path: "/packages", heading: "Packages & Pricing" },
  { path: "/team-management", heading: "Team Management" },
  { path: "/social-media", heading: "Social Media Hub" }
] as const;

const authStorageState = "test-results/.auth/ui-stub-user.json";

test.skip(
  !process.env.DEMO_COACH_EMAIL || !process.env.DEMO_COACH_PASSWORD,
  "DEMO_COACH_EMAIL and DEMO_COACH_PASSWORD are required for authenticated UI smoke tests."
);

function collectPageErrors(page: Page) {
  const errors: string[] = [];

  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") {
      errors.push(message.text());
    }
  });

  return errors;
}

async function signInDemoOwner(page: Page) {
  for (let attempt = 0; attempt < 2; attempt += 1) {
    await page.goto("/sign-in");
    await page.getByLabel("Email").fill(process.env.DEMO_COACH_EMAIL ?? "");
    await page.getByLabel("Password").fill(process.env.DEMO_COACH_PASSWORD ?? "");
    await page.getByRole("button", { name: "Sign in" }).click();

    try {
      await page.waitForURL(/\/$/, { timeout: 20_000 });
      await expect(page.getByRole("button", { name: /open account menu/i })).toBeVisible();
      return;
    } catch (error) {
      if (attempt === 1 || !page.url().includes("/api/auth/error")) {
        throw error;
      }
    }
  }
}

test.use({ storageState: authStorageState });

test.beforeAll(async ({ browser }) => {
  await mkdir(dirname(authStorageState), { recursive: true });

  const page = await browser.newPage({ storageState: undefined });

  try {
    await signInDemoOwner(page);
    await page.context().storageState({ path: authStorageState });
  } finally {
    await page.close();
  }
});

test.describe("UI stub navigation smoke", () => {
  for (const route of routeCases) {
    test(`renders ${route.path}`, async ({ page }) => {
      const errors = collectPageErrors(page);

      await page.goto(route.path);

      await expect(page.getByRole("heading", { level: 1, name: route.heading })).toBeVisible();
      await expect(page.getByRole("navigation", { name: "Primary navigation" })).toBeVisible();
      await expect(page.getByRole("link", { name: "Complete Coach dashboard" })).toBeVisible();
      expect(errors).toEqual([]);
    });
  }

  test("primary navigation can move through representative sections", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("link", { name: "Training Programs" })).toHaveCount(0);

    await page.getByRole("link", { name: "Training", exact: true }).click();
    await expect(page).toHaveURL(/\/training$/);
    await expect(page.getByRole("heading", { level: 1, name: "Training Programs" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Training Programs" })).toBeVisible();

    await page.getByRole("link", { name: "Training Programs" }).click();
    await expect(page).toHaveURL(/\/training\/programs$/);
    await expect(page.getByRole("heading", { level: 1, name: "Program Library" })).toBeVisible();

    await page.getByRole("link", { name: "Nutrition", exact: true }).click();
    await expect(page).toHaveURL(/\/nutrition$/);
    await expect(page.getByRole("heading", { level: 1, name: "Nutrition Plans" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Meal Plans" })).toBeVisible();

    await page.getByRole("link", { name: "Meal Plans" }).click();
    await expect(page).toHaveURL(/\/nutrition\/meal-plans$/);
    await expect(page.getByRole("heading", { level: 1, name: "Meal Plan Library" })).toBeVisible();

    await page.getByRole("link", { name: "Messages" }).click();
    await expect(page).toHaveURL(/\/messages$/);
    await expect(page.getByRole("heading", { level: 1, name: "Messages" })).toBeVisible();
  });

  test("M3 client and CRM API-backed flows render and move stages", async ({ page }) => {
    await page.route("**/api/v1/clients", async (route) => {
      if (route.request().method() !== "GET") {
        await route.fallback();
        return;
      }

      await route.fulfill({
        json: {
          data: [
            {
              id: "e2e-client",
              name: "E2E Client",
              packageName: "Persisted Coaching",
              compliance: 93,
              checkInDay: "Friday",
              latestCheckIn: "May 14, 2026",
              status: "active",
              startDate: "May 1, 2026",
              initials: "EC",
              avatarColor: "bg-slate-900"
            }
          ]
        }
      });
    });

    await page.route("**/api/v1/clients/e2e-client", async (route) => {
      await route.fulfill({
        json: {
          data: {
            id: "e2e-client",
            name: "E2E Client",
            packageName: "Persisted Coaching",
            compliance: 93,
            checkInDay: "Friday",
            latestCheckIn: "May 14, 2026",
            status: "active",
            startDate: "May 1, 2026",
            initials: "EC",
            avatarColor: "bg-slate-900"
          }
        }
      });
    });

    await page.route("**/api/v1/clients/e2e-client/profile", async (route) => {
      await route.fulfill({
        json: {
          data: {
            bio: "E2E persisted profile bio",
            goals: ["E2E Strength Goal"],
            dateOfBirth: "1990-05-14T00:00:00.000Z"
          }
        }
      });
    });

    await page.route("**/api/v1/leads", async (route) => {
      if (route.request().method() !== "GET") {
        await route.fallback();
        return;
      }

      await route.fulfill({
        json: {
          data: [
            {
              id: "e2e-lead",
              name: "E2E Lead",
              email: "e2e-lead@example.com",
              phone: "+1 555",
              source: "Website",
              lastContact: "Today",
              notes: "E2E lead notes",
              location: "Melbourne, AU",
              status: "warm",
              stage: "initial-contact",
              daysInStage: 2,
              initials: "EL"
            }
          ]
        }
      });
    });

    await page.route("**/api/v1/leads/e2e-lead/stage-transitions", async (route) => {
      await route.fulfill({
        json: {
          data: {
            id: "e2e-lead",
            name: "E2E Lead",
            email: "e2e-lead@example.com",
            phone: "+1 555",
            source: "Website",
            lastContact: "Today",
            notes: "E2E lead notes",
            location: "Melbourne, AU",
            status: "warm",
            stage: "proposal",
            daysInStage: 0,
            initials: "EL"
          }
        }
      });
    });

    await page.goto("/clients");
    const clientNameLink = page.getByRole("link", { exact: true, name: "E2E Client" });
    await expect(clientNameLink).toHaveAttribute(
      "href",
      "/clients/e2e-client"
    );

    await clientNameLink.click();
    await expect(page.getByRole("heading", { level: 1, name: "E2E Client" })).toBeVisible();
    await expect(page.getByText("E2E persisted profile bio")).toBeVisible();
    await expect(page.getByText("E2E Strength Goal")).toBeVisible();

    await page.goto("/clients/crm");
    await expect(page.getByRole("region", { name: "Initial Contact" })).toContainText("E2E Lead");
    await page.getByLabel("Move E2E Lead").selectOption("proposal");
    await expect(page.getByRole("region", { name: "Proposal Sent" })).toContainText("E2E Lead");
  });
});

test.describe("M4 forms, check-ins, and external API smoke", () => {
  test("coach creates, publishes, and assigns a check-in form", async ({ page }) => {
    const now = "2026-05-14T00:00:00.000Z";

    await page.route("**/api/v1/forms**", async (route) => {
      const request = route.request();
      const url = new URL(request.url());

      if (request.method() === "GET" && url.pathname === "/api/v1/forms") {
        await route.fulfill({ json: { data: [] } });
        return;
      }

      if (request.method() === "POST" && url.pathname === "/api/v1/forms") {
        await route.fulfill({
          json: {
            data: {
              id: "form_e2e",
              name: "E2E Weekly Check-In",
              description: "E2E check-in assignment",
              type: "check-in",
              status: "draft",
              currentVersionId: null,
              createdAt: now,
              updatedAt: now
            }
          }
        });
        return;
      }

      if (request.method() === "POST" && url.pathname === "/api/v1/forms/form_e2e/versions") {
        await route.fulfill({
          json: {
            data: {
              id: "version_e2e",
              formId: "form_e2e",
              versionNumber: 1,
              schema: {
                title: "E2E Weekly Check-In",
                description: "E2E check-in assignment",
                fields: []
              },
              ui: null,
              publishedAt: null,
              createdAt: now
            }
          }
        });
        return;
      }

      if (request.method() === "POST" && url.pathname === "/api/v1/forms/form_e2e/publish") {
        await route.fulfill({
          json: {
            data: {
              id: "form_e2e",
              name: "E2E Weekly Check-In",
              description: "E2E check-in assignment",
              type: "check-in",
              status: "published",
              currentVersionId: "version_e2e",
              createdAt: now,
              updatedAt: now
            }
          }
        });
        return;
      }

      if (request.method() === "POST" && url.pathname === "/api/v1/forms/form_e2e/assignments") {
        await route.fulfill({
          json: {
            data: {
              id: "assignment_e2e",
              formId: "form_e2e",
              formVersionId: "version_e2e",
              clientId: "e2e-client",
              status: "assigned",
              assignedAt: now
            }
          }
        });
        return;
      }

      await route.fallback();
    });

    await page.route("**/api/v1/clients?limit=100", async (route) => {
      await route.fulfill({
        json: {
          data: [
            {
              id: "e2e-client",
              name: "E2E Client"
            }
          ]
        }
      });
    });

    await page.goto("/forms");
    await page.getByRole("button", { name: /start from scratch/i }).click();
    await page.getByLabel("Form title").fill("E2E Weekly Check-In");
    await page.getByLabel("Form description").fill("E2E check-in assignment");

    await page.getByRole("button", { name: "Publish Form" }).click();
    await expect(page.getByRole("status")).toContainText("Form published and ready for assignment.");

    await expect(page.getByLabel("Assign to client")).toHaveValue("e2e-client");
    await page.getByRole("button", { name: "Assign Form" }).click();
    await expect(page.getByRole("status")).toContainText("Form assigned to selected client.");
  });

  test("coach reviews and completes an API-backed check-in", async ({ page }) => {
    const submittedAt = "2026-05-14T00:00:00.000Z";
    const pendingCheckIn = {
      id: "checkin_e2e",
      clientId: "e2e-client",
      formSubmissionId: "submission_e2e",
      name: "E2E Client",
      initials: "EC",
      submittedAt,
      assignedDay: submittedAt,
      dueAt: submittedAt,
      lastCheckIn: "Today",
      status: "pending",
      checkInStatus: "pending-review",
      summary: null,
      coachNotes: null
    };

    await page.route("**/api/v1/check-ins**", async (route) => {
      const request = route.request();
      const url = new URL(request.url());

      if (request.method() === "GET" && url.pathname === "/api/v1/check-ins") {
        await route.fulfill({ json: { data: [pendingCheckIn] } });
        return;
      }

      if (request.method() === "GET" && url.pathname === "/api/v1/check-ins/checkin_e2e") {
        await route.fulfill({
          json: {
            data: {
              ...pendingCheckIn,
              answers: {
                readiness: "8",
                body_weight: "82.5"
              },
              metrics: [
                {
                  id: "metric_e2e",
                  metricKey: "body_weight",
                  metricValue: 82.5,
                  unit: "kg",
                  measuredAt: submittedAt
                }
              ]
            }
          }
        });
        return;
      }

      if (request.method() === "POST" && url.pathname === "/api/v1/check-ins/checkin_e2e/review") {
        await route.fulfill({
          json: {
            data: {
              ...pendingCheckIn,
              summary: "E2E reviewed",
              coachNotes: "Ready for completion",
              checkInStatus: "reviewed"
            }
          }
        });
        return;
      }

      if (request.method() === "POST" && url.pathname === "/api/v1/check-ins/checkin_e2e/complete") {
        await route.fulfill({
          json: {
            data: {
              ...pendingCheckIn,
              status: "completed",
              summary: "E2E reviewed",
              coachNotes: "Ready for completion",
              checkInStatus: "completed"
            }
          }
        });
        return;
      }

      await route.fallback();
    });

    await page.goto("/clients/check-ins");
    await expect(page.getByRole("heading", { level: 2, name: "E2E Client" })).toBeVisible();
    await page.getByRole("button", { name: /view full check-in for E2E Client/i }).click();

    await expect(page.getByRole("dialog", { name: /check-in detail for E2E Client/i })).toContainText("body_weight");
    await page.getByLabel("Review summary").fill("E2E reviewed");
    await page.getByLabel("Coach notes").fill("Ready for completion");

    await page.getByRole("button", { name: "Mark reviewed" }).click();
    await expect(page.getByRole("status")).toContainText("Check-in reviewed.");

    await page.getByRole("button", { name: "Mark complete" }).click();
    await expect(page.getByRole("status")).toContainText("Check-in completed.");

    await page.getByRole("button", { name: "Close" }).click();
    await page.getByRole("tab", { name: "Completed" }).click();
    await expect(page.getByRole("heading", { level: 2, name: "E2E Client" })).toBeVisible();
  });

  test("external metrics API returns de-identified metrics", async ({ page }) => {
    await page.route("**/api/v1/external/metrics**", async (route) => {
      expect(route.request().headers().authorization).toBe("Bearer cc_test_e2e");

      await route.fulfill({
        json: {
          data: [
            {
              externalClientId: "client_ext_e2e",
              metricKey: "body_weight",
              metricValue: 82.5,
              unit: "kg",
              measuredAt: "2026-05-14T00:00:00.000Z",
              source: "form_submission"
            }
          ],
          pageInfo: {
            nextCursor: null,
            hasNextPage: false
          }
        }
      });
    });

    await page.goto("/");

    const payload = await page.evaluate(async () => {
      const response = await fetch("/api/v1/external/metrics?metric_key=body_weight", {
        headers: {
          Authorization: "Bearer cc_test_e2e"
        }
      });

      return response.json();
    });

    expect(payload.data[0]).toMatchObject({
      externalClientId: "client_ext_e2e",
      metricKey: "body_weight",
      metricValue: 82.5,
      unit: "kg"
    });
    expect(payload.data[0]).not.toHaveProperty("clientId");
    expect(payload.data[0]).not.toHaveProperty("name");
    expect(payload.data[0]).not.toHaveProperty("email");
    expect(payload.data[0]).not.toHaveProperty("phone");
  });
});

test.describe("UI stub accessibility smoke", () => {
  for (const route of routeCases) {
    test(`${route.path} has named interactive controls and a usable heading structure`, async ({ page }) => {
      await page.goto(route.path);

      await expect(page.getByRole("heading", { level: 1, name: route.heading })).toBeVisible();

      const unnamedControls = await page.locator("a[href], button, input, textarea, select").evaluateAll((elements) =>
        elements
          .map((element) => {
            const tagName = element.tagName.toLowerCase();
            const label = [
              element.getAttribute("aria-label"),
              element.getAttribute("title"),
              element.textContent,
              element.getAttribute("placeholder"),
              element.getAttribute("alt")
            ]
              .filter(Boolean)
              .join(" ")
              .trim();

            return {
              tagName,
              label,
              html: element.outerHTML.slice(0, 180)
            };
          })
          .filter((control) => control.label.length === 0)
      );

      expect(unnamedControls).toEqual([]);
    });
  }

  test("keyboard focus reaches global navigation and page controls", async ({ page }) => {
    await page.goto("/supplementation/database");

    const dashboardLink = page.getByRole("link", { name: "Complete Coach dashboard" });
    await expect(dashboardLink).toBeVisible();

    for (let attempt = 0; attempt < 5; attempt += 1) {
      const dashboardLinkFocused = await dashboardLink.evaluate(
        (element) => element === document.activeElement
      );

      if (dashboardLinkFocused) {
        break;
      }

      await page.keyboard.press("Tab");
    }

    await expect(dashboardLink).toBeFocused();

    await page.getByRole("button", { name: "New Entry" }).focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("dialog", { name: "New Protocol" })).toBeVisible();
    await page.getByRole("button", { name: "Close new protocol panel" }).focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("dialog", { name: "New Protocol" })).toBeHidden();
  });
});
