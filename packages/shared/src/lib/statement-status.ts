import type { Money } from "../types/money.js";
import type { StatementStatus } from "../types/statement.js";

/** £100/month in pence — lower bound for "tight". */
export const STATUS_TIGHT_MIN_PENCE = 10_000;

/** £300/month in pence — lower bound for "breathing room". */
export const STATUS_BREATHING_ROOM_MIN_PENCE = 30_000;

export function computeStatementStatus(
  netPosition: Money,
  totalIncome: Money,
): StatementStatus {
  if (totalIncome.amount === 0) {
    return "needsReview";
  }

  if (netPosition.amount < 0) {
    return "deficit";
  }

  if (netPosition.amount < STATUS_TIGHT_MIN_PENCE) {
    return "atRisk";
  }

  if (netPosition.amount < STATUS_BREATHING_ROOM_MIN_PENCE) {
    return "tight";
  }

  return "breathingRoom";
}
