import type { Money } from "./money.js";

/** Identifies a single calendar month. */
export interface StatementPeriod {
  /** Month of the year (1 = January, 12 = December). */
  month: number;
  /** Four-digit calendar year (e.g. 2026). */
  year: number;
}

/** Discriminator for the kind of financial movement on a statement. */
export type PaymentType = "income" | "expense" | "debtRepayment";

/**
 * A single financial movement recorded on a statement.
 * Unifies income, expenses, and debt repayments into one line-item type.
 */
export interface Payment {
  id: string;
  /** The statement this payment belongs to. */
  statementId: string;
  /** Whether money is coming in, going out, or paying down a debt. */
  type: PaymentType;
  /** The amount of the payment. */
  amount: Money;
  /** Short label describing the payment (e.g. "Salary"). */
  label: string;
  /** ISO date when the payment occurred (YYYY-MM-DD). */
  date: string;
  /** The date the payment was created. */
  createdAt: string;
}

/**
 * Top-level financial record for a single month and year.
 * Contains all payments (income, expenses, and debt repayments) for that period.
 */
export interface Statement {
  /** The unique identifier for the statement. */
  id: string;
  /** The user this statement belongs to. */
  userId: string;
  /** The period of the statement. */
  period: StatementPeriod;
  /** The payments made during the statement period. */
  payments: Payment[];
  /** The date the statement was created. */
  createdAt: string;
  /** The date the statement was last updated. */
  updatedAt: string;
}

/** Request body for creating a payment on a new statement. */
export interface CreatePaymentInput {
  type: PaymentType;
  label: string;
  amount: Money;
  /** ISO date (YYYY-MM-DD). Defaults to the first day of the statement period. */
  date?: string;
}

/** Request body for creating a new statement. */
export interface CreateStatementInput {
  userId: string;
  month: number;
  year: number;
  payments: CreatePaymentInput[];
}

/** Request body for updating an existing statement. */
export interface UpdateStatementInput {
  month: number;
  year: number;
  payments: CreatePaymentInput[];
}

/** Query parameters for listing statements for a user. */
export interface ListStatementsQuery {
  userId: string;
}

/** Aggregated totals derived from a statement's payments (not persisted). */
export interface StatementSummary {
  totalIncome: Money;
  totalExpenses: Money;
  totalDebtRepayments: Money;
  netPosition: Money;
  /** Derived from net position and total income — not persisted. */
  status: StatementStatus;
  /** Suggestive repayment guidance derived from status — not persisted. */
  repaymentGuidance: string;
  /** Plain-language explanation of why this status was assigned — not persisted. */
  whyAmISeeingThis: string;
}

/** Summary totals and status before client-facing guidance enrichment. */
export type StatementSummaryBase = Omit<
  StatementSummary,
  "repaymentGuidance" | "whyAmISeeingThis"
>;

/** Financial health band derived from monthly net position. */
export type StatementStatus =
  | "breathingRoom"
  | "tight"
  | "atRisk"
  | "deficit"
  | "needsReview";

/** Statement returned from the API with computed summary. */
export interface StatementWithSummary extends Statement {
  summary: StatementSummary;
}

export const STATEMENT_API_ROUTES = {
  statements: "/api/statements",
  statementById: (id: string) => `/api/statements/${id}`,
} as const;
