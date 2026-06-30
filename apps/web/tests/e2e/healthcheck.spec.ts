import { expect, test } from "@playwright/test";

test.describe("Financial Healthcheck dashboard", () => {
  test("loads healthcheck data from the API", async ({ page }) => {
    await page.goto("/");

    await expect(
      page.getByRole("heading", { name: "Financial Healthcheck" }),
    ).toBeVisible();

    await expect(page.getByText("Your Score")).toBeVisible();
    await expect(
      page.locator(".text-5xl.font-bold.text-primary", { hasText: "72" }),
    ).toBeVisible();
    await expect(page.getByText("Category Breakdown")).toBeVisible();
    await expect(page.getByText("Savings")).toBeVisible();
    await expect(page.getByText("Investments")).toBeVisible();
  });

  test("refreshes healthcheck data", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByText("Your Score")).toBeVisible();

    const refreshButton = page.getByRole("button", { name: "Refresh" });
    await refreshButton.click();

    await expect(page.getByText("Category Breakdown")).toBeVisible();
  });
});
