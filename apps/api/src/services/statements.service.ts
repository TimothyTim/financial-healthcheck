import type {
  CreateStatementInput,
  Payment,
  Statement,
  StatementSummary,
  StatementWithSummary,
} from "@financial-healthcheck/shared";
import {
  computeRepaymentGuidance,
  computeWhyAmISeeingThis,
} from "@financial-healthcheck/shared";
import { computeSummary } from "../lib/summary.js";

export class DuplicateStatementError extends Error {
  constructor(userId: string, month: number, year: number) {
    super(
      `Statement already exists for user ${userId} in ${month}/${year}`,
    );
    this.name = "DuplicateStatementError";
  }
}

function periodKey(userId: string, month: number, year: number): string {
  return `${userId}:${year}:${month}`;
}

function defaultPaymentDate(month: number, year: number): string {
  return `${year}-${String(month).padStart(2, "0")}-01`;
}

function createPayment(
  statementId: string,
  input: CreatePaymentInput,
  month: number,
  year: number,
  createdAt: string,
): Payment {
  return {
    id: crypto.randomUUID(),
    statementId,
    type: input.type,
    amount: input.amount,
    label: input.label,
    date: input.date ?? defaultPaymentDate(month, year),
    createdAt,
  };
}

function enrichSummary(payments: Payment[]): StatementSummary {
  const base = computeSummary(payments);

  return {
    ...base,
    repaymentGuidance: computeRepaymentGuidance(base.status),
    whyAmISeeingThis: computeWhyAmISeeingThis(base),
  };
}

export function createStatementsService() {
  const statements = new Map<string, Statement>();
  const periodIndex = new Map<string, string>();

  function createStatement(input: CreateStatementInput): StatementWithSummary {
    const key = periodKey(input.userId, input.month, input.year);

    if (periodIndex.has(key)) {
      throw new DuplicateStatementError(input.userId, input.month, input.year);
    }

    const now = new Date().toISOString();
    const id = crypto.randomUUID();

    const payments = input.payments.map((payment) =>
      createPayment(id, payment, input.month, input.year, now),
    );

    const statement: Statement = {
      id,
      userId: input.userId,
      period: { month: input.month, year: input.year },
      payments,
      createdAt: now,
      updatedAt: now,
    };

    statements.set(id, statement);
    periodIndex.set(key, id);

    return {
      ...statement,
      summary: enrichSummary(statement.payments),
    };
  }

  function listStatementsByUserId(userId: string): StatementWithSummary[] {
    return [...statements.values()]
      .filter((statement) => statement.userId === userId)
      .map((statement) => ({
        ...statement,
        summary: enrichSummary(statement.payments),
      }))
      .sort((a, b) => {
        if (a.period.year !== b.period.year) {
          return b.period.year - a.period.year;
        }

        return b.period.month - a.period.month;
      });
  }

  return { createStatement, listStatementsByUserId };
}

export const statementsService = createStatementsService();
