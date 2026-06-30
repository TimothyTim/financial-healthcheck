import { describe, expect, it } from "vitest";
import {
  computeRepaymentGuidance,
  computeWhyAmISeeingThis,
} from "@financial-healthcheck/shared";

describe("computeRepaymentGuidance", () => {
  it.each([
    "breathingRoom",
    "tight",
    "atRisk",
    "deficit",
    "needsReview",
  ] as const)("returns a non-empty string for %s", (status) => {
    expect(computeRepaymentGuidance(status).length).toBeGreaterThan(0);
  });

  it("returns stable guidance for each status", () => {
    expect(computeRepaymentGuidance("breathingRoom")).toBe(
      "You may have room to maintain or modestly increase repayments — confirm amounts with your creditors first.",
    );
    expect(computeRepaymentGuidance("deficit")).toBe(
      "Do not increase repayments for now — contact creditors and consider free debt advice.",
    );
  });
});

describe("computeWhyAmISeeingThis", () => {
  it.each([
    {
      status: "breathingRoom" as const,
      netPosition: { amount: 110_000 },
      totalIncome: { amount: 200_000 },
      expected:
        "Your monthly net position is £1,100.00 (at least £300 left after essentials and debt payments), so we class this as breathing room.",
    },
    {
      status: "tight" as const,
      netPosition: { amount: 15_000 },
      totalIncome: { amount: 200_000 },
      expected:
        "Your monthly net position is £150.00 (between £100 and £299 after essentials and debt payments), so we class this as tight.",
    },
    {
      status: "atRisk" as const,
      netPosition: { amount: 5_000 },
      totalIncome: { amount: 200_000 },
      expected:
        "Your monthly net position is £50.00 (under £100 after essentials and debt payments), so we class this as at risk.",
    },
    {
      status: "deficit" as const,
      netPosition: { amount: -1_000 },
      totalIncome: { amount: 200_000 },
      expected:
        "Your monthly net position is -£10.00 (spending and debt payments exceed income), so we class this as a deficit.",
    },
    {
      status: "needsReview" as const,
      netPosition: { amount: -1_000 },
      totalIncome: { amount: 0 },
      expected:
        "We need income information to calculate your net position and status — please review your statement entries.",
    },
  ])("explains $status", ({ status, netPosition, totalIncome, expected }) => {
    expect(
      computeWhyAmISeeingThis({ status, netPosition, totalIncome }),
    ).toBe(expected);
  });
});
