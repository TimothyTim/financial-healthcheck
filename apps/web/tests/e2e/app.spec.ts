import { expect, test } from "@playwright/test";
import {
  completeOnboarding,
  defaultStatementFormValues,
  fillNewStatementForm,
} from "./helpers";

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
  await expect(
    page.getByRole("heading", { name: "Your financial health" }),
  ).not.toBeVisible();
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
  await completeOnboarding(page);
  await fillNewStatementForm(page, defaultStatementFormValues);

  await page.getByRole("button", { name: "Submit statement" }).click();

  await expect(page).toHaveURL(/\/statement\/[0-9a-f-]+$/);
  await expect(page.getByRole("heading", { name: "June 2026" })).toBeVisible();
});

test("edit statement from detail page updates summary", async ({ page }) => {
  await page.goto("/");
  await completeOnboarding(page);
  await fillNewStatementForm(page, defaultStatementFormValues);
  await page.getByRole("button", { name: "Submit statement" }).click();

  await expect(page).toHaveURL(/\/statement\/[0-9a-f-]+$/);
  const statementUrl = page.url();
  const statementId = statementUrl.split("/").pop()!;

  await expect(page.getByRole("heading", { name: "June 2026" })).toBeVisible();
  const overview = page.locator("dl");
  await expect(
    overview
      .locator("div")
      .filter({ hasText: "Total monthly income" })
      .getByText("£2,000.00"),
  ).toBeVisible();
  await expect(
    overview
      .locator("div")
      .filter({ hasText: "Money left" })
      .getByText("£1,100.00"),
  ).toBeVisible();

  await page.getByRole("link", { name: "Edit" }).click();

  await expect(page).toHaveURL(`/statement/new?statementId=${statementId}`);
  await expect(
    page.getByRole("heading", { name: "Edit financial statement" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Save changes" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Use sample data" }),
  ).not.toBeVisible();

  const incomeSection = page
    .locator("section")
    .filter({ hasText: "Monthly income" });
  await expect(incomeSection.getByLabel("Label")).toHaveValue("Salary");
  await expect(incomeSection.getByLabel("Amount (£)")).toHaveValue("2000");

  const costsSection = page
    .locator("section")
    .filter({ hasText: "Monthly essential costs" });
  await expect(costsSection.getByLabel("Label")).toHaveValue("Rent");
  await expect(costsSection.getByLabel("Amount (£)")).toHaveValue("800");

  const debtSection = page
    .locator("section")
    .filter({ hasText: "Debt and financial commitments" });
  await expect(debtSection.getByLabel("Label")).toHaveValue("Credit card");
  await expect(debtSection.getByLabel("Amount (£)")).toHaveValue("100");

  await incomeSection.getByLabel("Amount (£)").fill("2500");

  await page.getByRole("button", { name: "Save changes" }).click();

  await expect(page).toHaveURL(`/statement/${statementId}`);
  await expect(page.getByRole("heading", { name: "June 2026" })).toBeVisible();
  const updatedOverview = page.locator("dl");
  await expect(
    updatedOverview
      .locator("div")
      .filter({ hasText: "Total monthly income" })
      .getByText("£2,500.00"),
  ).toBeVisible();
  await expect(
    updatedOverview
      .locator("div")
      .filter({ hasText: "Money left" })
      .getByText("£1,600.00"),
  ).toBeVisible();
});
