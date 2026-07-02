import type { StatementWithSummary } from "@financial-healthcheck/shared";
import { z } from "zod";

export const paymentItemSchema = z.object({
  label: z.string().trim().min(1, "Label is required"),
  amount: z.coerce
    .number({ message: "Amount is required" })
    .positive("Amount must be greater than zero"),
});

export const statementNewSchema = z.object({
  month: z.coerce.number().int().min(1).max(12),
  year: z.coerce.number().int().min(2000).max(2100),
  income: z.array(paymentItemSchema).min(1, "Add at least one income item"),
  essentialCosts: z
    .array(paymentItemSchema)
    .min(1, "Add at least one essential cost"),
  debtCommitments: z
    .array(paymentItemSchema)
    .min(1, "Add at least one debt or financial commitment"),
});

export type StatementNewFormValues = z.infer<typeof statementNewSchema>;

export function getDefaultStatementNewValues(): StatementNewFormValues {
  const now = new Date();

  return {
    month: now.getMonth() + 1,
    year: now.getFullYear(),
    income: [{ label: "", amount: 0 }],
    essentialCosts: [{ label: "", amount: 0 }],
    debtCommitments: [{ label: "", amount: 0 }],
  };
}

export function getSampleStatementNewValues(): StatementNewFormValues {
  const now = new Date();

  return {
    month: now.getMonth() + 1,
    year: now.getFullYear(),
    income: [{ label: "Salary", amount: 2500 }],
    essentialCosts: [
      { label: "Rent", amount: 900 },
      { label: "Utilities", amount: 150 },
    ],
    debtCommitments: [{ label: "Credit card", amount: 200 }],
  };
}

export const monthOptions = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
];

export function getYearOptions(currentYear = new Date().getFullYear()) {
  return Array.from({ length: 6 }, (_, index) => currentYear - index);
}

export function statementToFormValues(
  statement: StatementWithSummary,
): StatementNewFormValues {
  const toItem = (payment: StatementWithSummary["payments"][number]) => ({
    label: payment.label,
    amount: payment.amount.amount / 100,
  });

  return {
    month: statement.period.month,
    year: statement.period.year,
    income: statement.payments
      .filter((payment) => payment.type === "income")
      .map(toItem),
    essentialCosts: statement.payments
      .filter((payment) => payment.type === "expense")
      .map(toItem),
    debtCommitments: statement.payments
      .filter((payment) => payment.type === "debtRepayment")
      .map(toItem),
  };
}
