import type { StatementStatus } from "@financial-healthcheck/shared";

const statusLabels: Record<StatementStatus, string> = {
  breathingRoom: "Breathing room",
  tight: "Tight",
  atRisk: "At risk",
  deficit: "Deficit",
  needsReview: "Needs review",
};

export function formatStatementStatusLabel(status: StatementStatus): string {
  return statusLabels[status];
}
