import type { Page } from "@playwright/test";

export async function completeOnboarding(page: Page, name = "Alex") {
  await page.getByLabel("Your name").fill(name);
  await page.getByRole("button", { name: "Continue" }).click();
  await page
    .getByRole("button", { name: "Start financial health check" })
    .click();
}

interface StatementFormValues {
  income: { label: string; amount: string };
  costs: { label: string; amount: string };
  debt: { label: string; amount: string };
  month: string;
  year: string;
}

export async function fillNewStatementForm(
  page: Page,
  values: StatementFormValues,
) {
  const incomeSection = page
    .locator("section")
    .filter({ hasText: "Monthly income" });
  await incomeSection.getByPlaceholder("e.g. Salary").fill(values.income.label);
  await incomeSection.getByPlaceholder("0.00").fill(values.income.amount);

  const costsSection = page
    .locator("section")
    .filter({ hasText: "Monthly essential costs" });
  await costsSection.getByPlaceholder("e.g. Salary").fill(values.costs.label);
  await costsSection.getByPlaceholder("0.00").fill(values.costs.amount);

  const debtSection = page
    .locator("section")
    .filter({ hasText: "Debt and financial commitments" });
  await debtSection.getByPlaceholder("e.g. Salary").fill(values.debt.label);
  await debtSection.getByPlaceholder("0.00").fill(values.debt.amount);

  await page.getByLabel("Month").selectOption(values.month);
  await page.getByLabel("Year").selectOption(values.year);
}

export const defaultStatementFormValues: StatementFormValues = {
  income: { label: "Salary", amount: "2000" },
  costs: { label: "Rent", amount: "800" },
  debt: { label: "Credit card", amount: "100" },
  month: "6",
  year: "2026",
};
