import { describe, expect, it } from "vitest";
import type { StatementSummary } from "@financial-healthcheck/shared";
import { formatOutlookStatement } from "@/lib/format-outlook";

function summary(
  overrides: Partial<StatementSummary> & Pick<StatementSummary, "status" | "netPosition">,
): StatementSummary {
  return {
    totalIncome: { amount: 100_000 },
    totalExpenses: { amount: 40_000 },
    totalDebtRepayments: { amount: 10_000 },
    repaymentGuidance: "",
    whyAmISeeingThis: "",
    ...overrides,
  };
}

describe("formatOutlookStatement", () => {
  it("describes money left for a positive net position", () => {
    expect(
      formatOutlookStatement(
        summary({ status: "breathingRoom", netPosition: { amount: 50_000 } }),
      ),
    ).toBe("You have £500.00 left after regular outgoings.");
  });

  it("describes a shortfall for a deficit", () => {
    expect(
      formatOutlookStatement(
        summary({ status: "deficit", netPosition: { amount: -10_000 } }),
      ),
    ).toBe("You're £100.00 short after regular outgoings this month.");
  });

  it("prompts for income when status is needs review", () => {
    expect(
      formatOutlookStatement(
        summary({ status: "needsReview", netPosition: { amount: 0 } }),
      ),
    ).toBe("We need your income details to show what your outlook looks like.");
  });
});
