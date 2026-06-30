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
  amount: Money;
  /** Short label describing the payment (e.g. "Salary"). */
  label: string;
  /** ISO date when the payment occurred (YYYY-MM-DD). */
  date: string;
  createdAt: string;
}

/**
 * Top-level financial record for a single month and year.
 * Contains all payments (income, expenses, and debt repayments) for that period.
 */
export interface Statement {
  id: string;
  period: StatementPeriod;
  payments: Payment[];
  createdAt: string;
  updatedAt: string;
}
