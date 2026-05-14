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
