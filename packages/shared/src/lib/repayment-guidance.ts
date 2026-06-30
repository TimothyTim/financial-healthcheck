import type { StatementStatus, StatementSummary } from "../types/statement.js";

function formatGbp(pence: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(pence / 100);
}

const repaymentGuidanceByStatus: Record<StatementStatus, string> = {
  breathingRoom:
    "You may have room to maintain or modestly increase repayments — confirm amounts with your creditors first.",
  tight:
    "Keep repayments steady for now; review spending before committing to higher payments.",
  atRisk:
    "Prioritise essential costs; speak to creditors before increasing repayments.",
  deficit:
    "Do not increase repayments for now — contact creditors and consider free debt advice.",
  needsReview:
    "Add your income details so we can suggest appropriate repayment guidance.",
};

export function computeRepaymentGuidance(status: StatementStatus): string {
  return repaymentGuidanceByStatus[status];
}

export function computeWhyAmISeeingThis(
  summary: Pick<StatementSummary, "status" | "netPosition" | "totalIncome">,
): string {
  const net = formatGbp(summary.netPosition.amount);

  switch (summary.status) {
    case "breathingRoom":
      return `Your monthly net position is ${net} (at least £300 left after essentials and debt payments), so we class this as breathing room.`;
    case "tight":
      return `Your monthly net position is ${net} (between £100 and £299 after essentials and debt payments), so we class this as tight.`;
    case "atRisk":
      return `Your monthly net position is ${net} (under £100 after essentials and debt payments), so we class this as at risk.`;
    case "deficit":
      return `Your monthly net position is ${net} (spending and debt payments exceed income), so we class this as a deficit.`;
    case "needsReview":
      return "We need income information to calculate your net position and status — please review your statement entries.";
  }
}
