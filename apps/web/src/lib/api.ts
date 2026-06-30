import {
  STATEMENT_API_ROUTES,
  type StatementWithSummary,
} from "@financial-healthcheck/shared";

export async function fetchStatements(
  userId: string,
): Promise<StatementWithSummary[]> {
  const url = `${STATEMENT_API_ROUTES.statements}?userId=${encodeURIComponent(userId)}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Failed to fetch statements");
  }

  return response.json() as Promise<StatementWithSummary[]>;
}
