import {
  STATEMENT_API_ROUTES,
  type CreateStatementInput,
  type StatementWithSummary,
  type UpdateStatementInput,
} from "@financial-healthcheck/shared";

export class CreateStatementError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "CreateStatementError";
  }
}

export class UpdateStatementError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "UpdateStatementError";
  }
}

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

export async function fetchStatement(
  id: string,
): Promise<StatementWithSummary> {
  const response = await fetch(STATEMENT_API_ROUTES.statementById(id));

  if (response.status === 404) {
    throw new Error("Statement not found");
  }

  if (!response.ok) {
    throw new Error("Failed to fetch statement");
  }

  return response.json() as Promise<StatementWithSummary>;
}

export async function createStatement(
  input: CreateStatementInput,
): Promise<StatementWithSummary> {
  const response = await fetch(STATEMENT_API_ROUTES.statements, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;
    const message =
      typeof body?.error === "string"
        ? body.error
        : response.status === 409
          ? "A statement already exists for this month"
          : "Failed to create statement";

    throw new CreateStatementError(message, response.status);
  }

  return response.json() as Promise<StatementWithSummary>;
}

export async function updateStatement(
  id: string,
  input: UpdateStatementInput,
): Promise<StatementWithSummary> {
  const response = await fetch(STATEMENT_API_ROUTES.statementById(id), {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;
    const message =
      typeof body?.error === "string"
        ? body.error
        : response.status === 404
          ? "Statement not found"
          : response.status === 409
            ? "A statement already exists for this month"
            : "Failed to update statement";

    throw new UpdateStatementError(message, response.status);
  }

  return response.json() as Promise<StatementWithSummary>;
}
