import { expect, test } from "@playwright/test";

test("onboarding flow sets name and shows greeting", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByText("What shall we call you?")).toBeVisible();

  await page.getByLabel("Your name").fill("Alex");
  await page.getByRole("button", { name: "Continue" }).click();

  await expect(page.getByText("Hello, Alex")).toBeVisible();
});
