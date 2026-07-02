import { describe, expect, it } from "vitest";
import {
  createStatementsService,
  DuplicateStatementError,
  StatementNotFoundError,
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

const breathingRoomGuidance =
  "You may have room to maintain or modestly increase repayments — confirm amounts with your creditors first.";
const breathingRoomExplanation =
  "Your monthly net position is £1,100.00 (at least £300 left after essentials and debt payments), so we class this as breathing room.";

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
      status: "breathingRoom",
      repaymentGuidance: breathingRoomGuidance,
      whyAmISeeingThis: breathingRoomExplanation,
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

  it("returns a statement by id with enriched summary", () => {
    const service = createStatementsService();

    const created = service.createStatement({
      userId: "user-get",
      month: 6,
      year: 2026,
      payments: samplePayments,
    });

    const result = service.getStatementById(created.id);

    expect(result).toEqual(created);
  });

  it("returns undefined for an unknown statement id", () => {
    const service = createStatementsService();

    expect(service.getStatementById("missing-id")).toBeUndefined();
  });

  describe("updateStatement", () => {
    it("updates payments and recalculates summary", () => {
      const service = createStatementsService();

      const created = service.createStatement({
        userId: "user-1",
        month: 6,
        year: 2026,
        payments: samplePayments,
      });

      const updatedPayments = [
        { type: "income" as const, label: "Bonus", amount: { amount: 50_000 } },
        { type: "expense" as const, label: "Groceries", amount: { amount: 30_000 } },
        {
          type: "debtRepayment" as const,
          label: "Loan",
          amount: { amount: 5_000 },
        },
      ];

      const result = service.updateStatement(created.id, {
        month: 6,
        year: 2026,
        payments: updatedPayments,
      });

      expect(result.id).toBe(created.id);
      expect(result.userId).toBe("user-1");
      expect(result.createdAt).toBe(created.createdAt);
      expect(result.updatedAt >= created.updatedAt).toBe(true);
      expect(result.period).toEqual({ month: 6, year: 2026 });
      expect(result.payments).toHaveLength(3);
      expect(result.payments[0]).toMatchObject({
        type: "income",
        label: "Bonus",
        amount: { amount: 50_000 },
      });
      expect(result.summary).toEqual({
        totalIncome: { amount: 50_000 },
        totalExpenses: { amount: 30_000 },
        totalDebtRepayments: { amount: 5_000 },
        netPosition: { amount: 15_000 },
        status: "tight",
        repaymentGuidance:
          "Keep repayments steady for now; review spending before committing to higher payments.",
        whyAmISeeingThis:
          "Your monthly net position is £150.00 (between £100 and £299 after essentials and debt payments), so we class this as tight.",
      });
    });

    it("changes period and updates list order", () => {
      const service = createStatementsService();

      const created = service.createStatement({
        userId: "user-1",
        month: 3,
        year: 2025,
        payments: samplePayments,
      });

      const result = service.updateStatement(created.id, {
        month: 12,
        year: 2026,
        payments: samplePayments,
      });

      expect(result.period).toEqual({ month: 12, year: 2026 });
      expect(service.getStatementById(created.id)?.period).toEqual({
        month: 12,
        year: 2026,
      });

      const listed = service.listStatementsByUserId("user-1");

      expect(listed).toHaveLength(1);
      expect(listed[0]?.period).toEqual({ month: 12, year: 2026 });
    });

    it("allows updating payments on the same period", () => {
      const service = createStatementsService();

      const created = service.createStatement({
        userId: "user-1",
        month: 6,
        year: 2026,
        payments: samplePayments,
      });

      expect(() =>
        service.updateStatement(created.id, {
          month: 6,
          year: 2026,
          payments: [
            { type: "income", label: "Salary", amount: { amount: 100_000 } },
            { type: "expense", label: "Rent", amount: { amount: 40_000 } },
            {
              type: "debtRepayment",
              label: "Card",
              amount: { amount: 5_000 },
            },
          ],
        }),
      ).not.toThrow();
    });

    it("throws StatementNotFoundError for unknown id", () => {
      const service = createStatementsService();

      expect(() =>
        service.updateStatement("missing-id", {
          month: 6,
          year: 2026,
          payments: samplePayments,
        }),
      ).toThrow(StatementNotFoundError);
    });

    it("throws DuplicateStatementError when moving to an occupied period", () => {
      const service = createStatementsService();

      const june = service.createStatement({
        userId: "user-1",
        month: 6,
        year: 2026,
        payments: samplePayments,
      });

      const july = service.createStatement({
        userId: "user-1",
        month: 7,
        year: 2026,
        payments: samplePayments,
      });

      expect(() =>
        service.updateStatement(july.id, {
          month: 6,
          year: 2026,
          payments: samplePayments,
        }),
      ).toThrow(DuplicateStatementError);

      expect(service.getStatementById(june.id)?.period).toEqual({
        month: 6,
        year: 2026,
      });
      expect(service.getStatementById(july.id)?.period).toEqual({
        month: 7,
        year: 2026,
      });
    });

    it("throws DuplicateStatementError when updating to another statement's period", () => {
      const service = createStatementsService();

      service.createStatement({
        userId: "user-1",
        month: 6,
        year: 2026,
        payments: samplePayments,
      });

      const other = service.createStatement({
        userId: "user-1",
        month: 7,
        year: 2026,
        payments: samplePayments,
      });

      expect(() =>
        service.updateStatement(other.id, {
          month: 6,
          year: 2026,
          payments: samplePayments,
        }),
      ).toThrow(DuplicateStatementError);
    });

    it("frees the old period when moving to a free month", () => {
      const service = createStatementsService();

      const created = service.createStatement({
        userId: "user-1",
        month: 6,
        year: 2026,
        payments: samplePayments,
      });

      service.updateStatement(created.id, {
        month: 8,
        year: 2026,
        payments: samplePayments,
      });

      const replacement = service.createStatement({
        userId: "user-1",
        month: 6,
        year: 2026,
        payments: samplePayments,
      });

      expect(replacement.period).toEqual({ month: 6, year: 2026 });
      expect(service.getStatementById(created.id)?.period).toEqual({
        month: 8,
        year: 2026,
      });
    });
  });
});
