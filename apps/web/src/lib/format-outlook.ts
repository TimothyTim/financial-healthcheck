import type { StatementSummary } from "@financial-healthcheck/shared";
import { formatMoney } from "@/lib/format-money";

export function formatOutlookStatement(summary: StatementSummary): string {
  if (summary.status === "needsReview") {
    return "We need your income details to show what your outlook looks like.";
  }

  const net = summary.netPosition.amount;

  if (net < 0) {
    return `You're ${formatMoney({ amount: Math.abs(net) })} short after regular outgoings this month.`;
  }

  return `You have ${formatMoney(summary.netPosition)} left after regular outgoings.`;
}
