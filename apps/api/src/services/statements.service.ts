import type {
  CreateStatementInput,
  Statement,
  StatementWithSummary,
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

    const statement: Statement = {
      id,
      userId: input.userId,
      period: { month: input.month, year: input.year },
      payments: [],
      createdAt: now,
      updatedAt: now,
    };

    statements.set(id, statement);
    periodIndex.set(key, id);

    return {
      ...statement,
      summary: computeSummary(statement.payments),
    };
  }

  function listStatementsByUserId(userId: string): StatementWithSummary[] {
    return [...statements.values()]
      .filter((statement) => statement.userId === userId)
      .map((statement) => ({
        ...statement,
        summary: computeSummary(statement.payments),
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
