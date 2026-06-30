import { expect, test } from "@playwright/test";

test("onboarding flow shows dashboard and fetches statements", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByText("What shall we call you?")).toBeVisible();

  await page.getByLabel("Your name").fill("Alex");
  await page.getByRole("button", { name: "Continue" }).click();

  await expect(
    page.getByRole("button", { name: "Start financial health check" }),
  ).toBeVisible();
  await expect(
    page.getByText(
      "This will help you better understand your financial health and manage your way out of debt.",
    ),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "Dashboard" })).not.toBeVisible();
});

test("empty dashboard CTA navigates to new statement page", async ({ page }) => {
  await page.goto("/");

  await page.getByLabel("Your name").fill("Alex");
  await page.getByRole("button", { name: "Continue" }).click();

  await page
    .getByRole("button", { name: "Start financial health check" })
    .click();

  await expect(page).toHaveURL("/statement/new");
  await expect(
    page.getByRole("heading", { name: "Add a new financial statement" }),
  ).toBeVisible();
});

test("new statement form submits and redirects to statement detail", async ({
  page,
}) => {
  await page.goto("/");

  await page.getByLabel("Your name").fill("Alex");
  await page.getByRole("button", { name: "Continue" }).click();
  await page
    .getByRole("button", { name: "Start financial health check" })
    .click();

  const incomeSection = page
    .locator("section")
    .filter({ hasText: "Monthly income" });
  await incomeSection.getByPlaceholder("e.g. Salary").fill("Salary");
  await incomeSection.getByPlaceholder("0.00").fill("2000");

  const costsSection = page
    .locator("section")
    .filter({ hasText: "Monthly essential costs" });
  await costsSection.getByPlaceholder("e.g. Salary").fill("Rent");
  await costsSection.getByPlaceholder("0.00").fill("800");

  const debtSection = page
    .locator("section")
    .filter({ hasText: "Debt and financial commitments" });
  await debtSection.getByPlaceholder("e.g. Salary").fill("Credit card");
  await debtSection.getByPlaceholder("0.00").fill("100");

  await page.getByRole("button", { name: "Submit statement" }).click();

  await expect(page).toHaveURL(/\/statement\/[0-9a-f-]+$/);
  await expect(page.getByRole("heading", { name: "June 2026" })).toBeVisible();
});
