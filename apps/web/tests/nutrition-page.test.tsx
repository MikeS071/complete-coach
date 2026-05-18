import { fireEvent, render, screen, within } from "@testing-library/react";
import { createElement } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { FoodDatabasePage } from "@/components/nutrition/food-database-page";
import { MealPlansPage } from "@/components/nutrition/meal-plans-page";
import { NutritionPage } from "@/components/nutrition/nutrition-page";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("NutritionPage", () => {
  it("renders nutrition overview cards and recent logs", () => {
    render(createElement(NutritionPage));

    expect(screen.getByRole("heading", { level: 1, name: "Nutrition Plans" })).toBeInTheDocument();
    expect(screen.getByText("Active Meal Plans")).toBeInTheDocument();
    expect(screen.getByText("High Performance Macro Split")).toBeInTheDocument();
    expect(screen.getByText("Recent Meal Logs")).toBeInTheDocument();
  });
});

describe("MealPlansPage", () => {
  it("switches between active assignments and master templates", () => {
    render(createElement(MealPlansPage));

    expect(screen.getByRole("heading", { level: 1, name: "Meal Plan Library" })).toBeInTheDocument();
    expect(screen.getByText("James S. Miller")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: "Master Nutrition Templates" }));

    expect(screen.getByRole("tabpanel", { name: "Master Nutrition Templates" })).toHaveTextContent(
      "High-Protein Breakfast Bowl"
    );
    expect(screen.queryByText("James S. Miller")).not.toBeInTheDocument();
  });

  it("renders meal-plan actions", () => {
    render(createElement(MealPlansPage));

    expect(screen.getByRole("button", { name: "Recipes" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Access Protocol" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "View All Active" })).toBeInTheDocument();
  });
});

describe("FoodDatabasePage", () => {
  it("loads API-backed foods when persistence is available", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          data: [
            {
              id: "food_api_1",
              scope: "private",
              name: "API Turkey Mince",
              category: "Proteins",
              servingSize: "100g cooked",
              calories: 180,
              proteinGrams: 28,
              carbsGrams: 0,
              fatGrams: 8
            }
          ]
        }),
        { status: 200 }
      )
    );

    render(createElement(FoodDatabasePage));

    expect(await screen.findByText("API Turkey Mince")).toBeInTheDocument();
    expect(screen.getByText("100g cooked")).toBeInTheDocument();
    expect(screen.getByText("28g")).toBeInTheDocument();
    expect(screen.queryByText("Chicken Breast")).not.toBeInTheDocument();
  });

  it("creates a persisted food from the food database", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(new Response(JSON.stringify({ data: [] }), { status: 200 }))
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            data: {
              id: "food_created",
              scope: "private",
              name: "Coach Food 1",
              category: "Custom",
              servingSize: "100g",
              calories: 250,
              proteinGrams: 20,
              carbsGrams: 25,
              fatGrams: 8
            }
          }),
          { status: 201 }
        )
      );

    render(createElement(FoodDatabasePage));

    await screen.findByText("No persisted foods match the current filters.");
    fireEvent.click(screen.getByRole("button", { name: "Create New Food" }));

    expect(await screen.findByText("Food saved to persistence API.")).toBeInTheDocument();
    expect(screen.getByText("Coach Food 1")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/foods",
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining("Coach Food 1")
      })
    );
  });

  it("falls back to fixture foods when the persistence API is unavailable", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(new Response(null, { status: 503 }));

    render(createElement(FoodDatabasePage));

    expect(await screen.findByText("Food persistence API unavailable. Showing fixture food library.")).toBeInTheDocument();
    expect(screen.getByText("Chicken Breast")).toBeInTheDocument();
  });

  it("shows a save error when persisted food creation fails", async () => {
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(new Response(JSON.stringify({ data: [] }), { status: 200 }))
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ error: { message: "Macro values are invalid." } }), {
          status: 422
        })
      );

    render(createElement(FoodDatabasePage));

    await screen.findByText("No persisted foods match the current filters.");
    fireEvent.click(screen.getByRole("button", { name: "Create New Food" }));

    expect(await screen.findByText("Macro values are invalid.")).toBeInTheDocument();
  });

  it("searches foods by name", () => {
    render(createElement(FoodDatabasePage));

    fireEvent.change(screen.getByRole("searchbox", { name: /search foods/i }), {
      target: { value: "rice" }
    });

    expect(screen.getByText("Basmati Rice")).toBeInTheDocument();
    expect(screen.queryByText("Chicken Breast")).not.toBeInTheDocument();
  });

  it("filters foods by category", () => {
    render(createElement(FoodDatabasePage));

    fireEvent.click(screen.getByRole("button", { name: "Proteins" }));

    const grid = screen.getByRole("region", { name: "Food grid" });
    expect(within(grid).getByText("Chicken Breast")).toBeInTheDocument();
    expect(within(grid).getByText("Whey Isolate")).toBeInTheDocument();
    expect(within(grid).queryByText("Basmati Rice")).not.toBeInTheDocument();
  });

  it("updates pagination controls locally", () => {
    render(createElement(FoodDatabasePage));

    expect(screen.getByRole("status", { name: "Food database page" })).toHaveTextContent("Page 1");

    fireEvent.click(screen.getByRole("button", { name: "Next food page" }));

    expect(screen.getByRole("status", { name: "Food database page" })).toHaveTextContent("Page 2");

    fireEvent.click(screen.getByRole("button", { name: "Previous food page" }));

    expect(screen.getByRole("status", { name: "Food database page" })).toHaveTextContent("Page 1");
  });
});
