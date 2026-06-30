import { describe, expect, it } from "vitest";
import {
  createStatementsService,
  DuplicateStatementError,
} from "./statements.service.js";

const samplePayments = [
  { type: "income" as const, label: "Salary", amount: { amount: 200_000 } },
  { type: "expense" as const, label: "Rent", amount: { amount: 80_000 } },
  {
    type: "debtRepayment" as const,
    label: "Credit card",
    amount: { amount: 10_000 },
  },
];

describe("statements service", () => {
  it("creates a statement with payments and computed summary", () => {
    const service = createStatementsService();

    const result = service.createStatement({
      userId: "user-1",
      month: 6,
      year: 2026,
      payments: samplePayments,
    });

    expect(result.userId).toBe("user-1");
    expect(result.period).toEqual({ month: 6, year: 2026 });
    expect(result.payments).toHaveLength(3);
    expect(result.payments[0]).toMatchObject({
      type: "income",
      label: "Salary",
      amount: { amount: 200_000 },
      date: "2026-06-01",
    });
    expect(result.summary).toEqual({
      totalIncome: { amount: 200_000 },
      totalExpenses: { amount: 80_000 },
      totalDebtRepayments: { amount: 10_000 },
      netPosition: { amount: 110_000 },
    });
    expect(result.id).toBeTruthy();
    expect(result.createdAt).toBeTruthy();
    expect(result.updatedAt).toBeTruthy();
  });

  it("rejects duplicate userId + period", () => {
    const service = createStatementsService();
    const input = {
      userId: "user-1",
      month: 6,
      year: 2026,
      payments: samplePayments,
    };

    service.createStatement(input);

    expect(() => service.createStatement(input)).toThrow(DuplicateStatementError);
  });

  it("allows the same period for different users", () => {
    const service = createStatementsService();

    const first = service.createStatement({
      userId: "user-1",
      month: 6,
      year: 2026,
      payments: samplePayments,
    });
    const second = service.createStatement({
      userId: "user-2",
      month: 6,
      year: 2026,
      payments: samplePayments,
    });

    expect(first.id).not.toBe(second.id);
    expect(first.userId).toBe("user-1");
    expect(second.userId).toBe("user-2");
  });

  it("returns an empty array for an unknown userId", () => {
    const service = createStatementsService();

    expect(service.listStatementsByUserId("unknown-user")).toEqual([]);
  });

  it("returns only statements for the requested user with summaries", () => {
    const service = createStatementsService();

    service.createStatement({
      userId: "user-1",
      month: 5,
      year: 2026,
      payments: samplePayments,
    });
    service.createStatement({
      userId: "user-2",
      month: 6,
      year: 2026,
      payments: samplePayments,
    });
    service.createStatement({
      userId: "user-1",
      month: 7,
      year: 2026,
      payments: samplePayments,
    });

    const results = service.listStatementsByUserId("user-1");

    expect(results).toHaveLength(2);
    expect(results.every((statement) => statement.userId === "user-1")).toBe(
      true,
    );
    expect(results.every((statement) => statement.summary)).toBe(true);
  });

  it("sorts statements by period descending", () => {
    const service = createStatementsService();

    service.createStatement({
      userId: "user-1",
      month: 3,
      year: 2025,
      payments: samplePayments,
    });
    service.createStatement({
      userId: "user-1",
      month: 12,
      year: 2026,
      payments: samplePayments,
    });
    service.createStatement({
      userId: "user-1",
      month: 6,
      year: 2026,
      payments: samplePayments,
    });

    const results = service.listStatementsByUserId("user-1");

    expect(results.map((statement) => statement.period)).toEqual([
      { month: 12, year: 2026 },
      { month: 6, year: 2026 },
      { month: 3, year: 2025 },
    ]);
  });

  it("preserves custom payment dates when provided", () => {
    const service = createStatementsService();

    const result = service.createStatement({
      userId: "user-dates",
      month: 1,
      year: 2026,
      payments: [
        {
          type: "income",
          label: "Salary",
          amount: { amount: 100 },
          date: "2026-01-15",
        },
        { type: "expense", label: "Rent", amount: { amount: 50 } },
        { type: "debtRepayment", label: "Loan", amount: { amount: 25 } },
      ],
    });

    expect(result.payments[0]?.date).toBe("2026-01-15");
    expect(result.payments[1]?.date).toBe("2026-01-01");
  });
});
