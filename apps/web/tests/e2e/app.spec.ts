import { expect, test } from "@playwright/test";

test("onboarding flow shows dashboard and fetches statements", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByText("What shall we call you?")).toBeVisible();

  await page.getByLabel("Your name").fill("Alex");
  await page.getByRole("button", { name: "Continue" }).click();

  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  await expect(page.getByText("Hello, Alex")).toBeVisible();
  await expect(page.getByText("No statements yet")).toBeVisible();
});
