import { describe, expect, it } from "vitest";
import type { Payment } from "@financial-healthcheck/shared";
import {
  computeStatementStatus,
  STATUS_BREATHING_ROOM_MIN_PENCE,
  STATUS_TIGHT_MIN_PENCE,
} from "@financial-healthcheck/shared";
import { computeSummary } from "./summary.js";

function payment(
  type: Payment["type"],
  amount: number,
  label = "Item",
): Payment {
  return {
    id: crypto.randomUUID(),
    statementId: "stmt-test",
    type,
    amount: { amount },
    label,
    date: "2026-06-01",
    createdAt: "2026-06-01T00:00:00.000Z",
  };
}

describe("computeStatementStatus", () => {
  it.each([
    { net: 50_000, income: 200_000, status: "breathingRoom" },
    { net: 15_000, income: 200_000, status: "tight" },
    { net: 5_000, income: 200_000, status: "atRisk" },
    { net: -1_000, income: 200_000, status: "deficit" },
    { net: 10_000, income: 0, status: "needsReview" },
    { net: 9_999, income: 100_000, status: "atRisk" },
    { net: 10_000, income: 100_000, status: "tight" },
    { net: 29_999, income: 100_000, status: "tight" },
    { net: 30_000, income: 100_000, status: "breathingRoom" },
  ] as const)(
    "returns $status when net is $net and income is $income",
    ({ net, income, status }) => {
      expect(
        computeStatementStatus({ amount: net }, { amount: income }),
      ).toBe(status);
    },
  );

  it("exports expected threshold constants", () => {
    expect(STATUS_TIGHT_MIN_PENCE).toBe(10_000);
    expect(STATUS_BREATHING_ROOM_MIN_PENCE).toBe(30_000);
  });
});

describe("computeSummary", () => {
  it("includes status on the summary", () => {
    const summary = computeSummary([
      payment("income", 200_000, "Salary"),
      payment("expense", 80_000, "Rent"),
      payment("debtRepayment", 10_000, "Card"),
    ]);

    expect(summary).toEqual({
      totalIncome: { amount: 200_000 },
      totalExpenses: { amount: 80_000 },
      totalDebtRepayments: { amount: 10_000 },
      netPosition: { amount: 110_000 },
      status: "breathingRoom",
    });
  });

  it("returns needsReview when there is no income", () => {
    const summary = computeSummary([
      payment("expense", 500, "Rent"),
      payment("debtRepayment", 500, "Card"),
    ]);

    expect(summary.status).toBe("needsReview");
    expect(summary.netPosition).toEqual({ amount: -1_000 });
  });
});
