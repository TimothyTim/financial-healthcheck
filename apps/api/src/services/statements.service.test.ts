import { describe, expect, it } from "vitest";
import { zeroMoney } from "../lib/summary.js";
import {
  createStatementsService,
  DuplicateStatementError,
} from "./statements.service.js";

describe("statements service", () => {
  it("creates a statement with userId, period, empty payments, and zero summary", () => {
    const service = createStatementsService();

    const result = service.createStatement({
      userId: "user-1",
      month: 6,
      year: 2026,
    });

    expect(result.userId).toBe("user-1");
    expect(result.period).toEqual({ month: 6, year: 2026 });
    expect(result.payments).toEqual([]);
    expect(result.summary).toEqual({
      totalIncome: zeroMoney,
      totalExpenses: zeroMoney,
      totalDebtRepayments: zeroMoney,
      netPosition: zeroMoney,
    });
    expect(result.id).toBeTruthy();
    expect(result.createdAt).toBeTruthy();
    expect(result.updatedAt).toBeTruthy();
  });

  it("rejects duplicate userId + period", () => {
    const service = createStatementsService();
    const input = { userId: "user-1", month: 6, year: 2026 };

    service.createStatement(input);

    expect(() => service.createStatement(input)).toThrow(DuplicateStatementError);
  });

  it("allows the same period for different users", () => {
    const service = createStatementsService();

    const first = service.createStatement({
      userId: "user-1",
      month: 6,
      year: 2026,
    });
    const second = service.createStatement({
      userId: "user-2",
      month: 6,
      year: 2026,
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

    service.createStatement({ userId: "user-1", month: 5, year: 2026 });
    service.createStatement({ userId: "user-2", month: 6, year: 2026 });
    service.createStatement({ userId: "user-1", month: 7, year: 2026 });

    const results = service.listStatementsByUserId("user-1");

    expect(results).toHaveLength(2);
    expect(results.every((statement) => statement.userId === "user-1")).toBe(
      true,
    );
    expect(results.every((statement) => statement.summary)).toBe(true);
  });

  it("sorts statements by period descending", () => {
    const service = createStatementsService();

    service.createStatement({ userId: "user-1", month: 3, year: 2025 });
    service.createStatement({ userId: "user-1", month: 12, year: 2026 });
    service.createStatement({ userId: "user-1", month: 6, year: 2026 });

    const results = service.listStatementsByUserId("user-1");

    expect(results.map((statement) => statement.period)).toEqual([
      { month: 12, year: 2026 },
      { month: 6, year: 2026 },
      { month: 3, year: 2025 },
    ]);
  });
});
