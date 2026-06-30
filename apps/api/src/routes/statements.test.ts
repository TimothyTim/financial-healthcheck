import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../app.js";

const samplePayments = [
  { type: "income", label: "Salary", amount: { amount: 200_000 } },
  { type: "expense", label: "Rent", amount: { amount: 80_000 } },
  { type: "debtRepayment", label: "Credit card", amount: { amount: 10_000 } },
];

describe("POST /api/statements", () => {
  const app = createApp();

  it("creates a statement with payments and computed summary", async () => {
    const response = await request(app)
      .post("/api/statements")
      .send({ userId: "user-create", month: 6, year: 2026, payments: samplePayments });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      userId: "user-create",
      period: { month: 6, year: 2026 },
      summary: {
        totalIncome: { amount: 200_000 },
        totalExpenses: { amount: 80_000 },
        totalDebtRepayments: { amount: 10_000 },
        netPosition: { amount: 110_000 },
        status: "breathingRoom",
      },
    });
    expect(response.body.payments).toHaveLength(3);
    expect(response.body.payments[0]).toMatchObject({
      type: "income",
      label: "Salary",
      date: "2026-06-01",
    });
    expect(response.body.id).toBeTruthy();
    expect(response.body.createdAt).toBeTruthy();
    expect(response.body.updatedAt).toBeTruthy();
    expect(response.body.summary.repaymentGuidance).toBe(
      "You may have room to maintain or modestly increase repayments — confirm amounts with your creditors first.",
    );
    expect(response.body.summary.whyAmISeeingThis).toBe(
      "Your monthly net position is £1,100.00 (at least £300 left after essentials and debt payments), so we class this as breathing room.",
    );
  });

  it("returns 409 for duplicate userId + period", async () => {
    const payload = {
      userId: "user-dup",
      month: 7,
      year: 2026,
      payments: samplePayments,
    };

    await request(app).post("/api/statements").send(payload);

    const response = await request(app).post("/api/statements").send(payload);

    expect(response.status).toBe(409);
    expect(response.body.error).toContain("user-dup");
  });

  it("allows the same period for different users", async () => {
    const response = await request(app)
      .post("/api/statements")
      .send({
        userId: "user-b",
        month: 8,
        year: 2026,
        payments: samplePayments,
      });

    expect(response.status).toBe(201);
    expect(response.body.userId).toBe("user-b");
  });

  it("returns 400 when userId is missing", async () => {
    const response = await request(app)
      .post("/api/statements")
      .send({ month: 6, year: 2026, payments: samplePayments });

    expect(response.status).toBe(400);
  });

  it("returns 400 for invalid month", async () => {
    const response = await request(app)
      .post("/api/statements")
      .send({
        userId: "user-invalid",
        month: 13,
        year: 2026,
        payments: samplePayments,
      });

    expect(response.status).toBe(400);
  });

  it("returns 400 when payments are missing", async () => {
    const response = await request(app)
      .post("/api/statements")
      .send({ userId: "user-no-payments", month: 6, year: 2026 });

    expect(response.status).toBe(400);
  });

  it("returns 400 when a required payment type is missing", async () => {
    const response = await request(app)
      .post("/api/statements")
      .send({
        userId: "user-missing-type",
        month: 6,
        year: 2026,
        payments: [
          { type: "income", label: "Salary", amount: { amount: 100 } },
          { type: "expense", label: "Rent", amount: { amount: 50 } },
        ],
      });

    expect(response.status).toBe(400);
  });
});

describe("GET /api/statements", () => {
  const app = createApp();

  it("returns an empty array when the user has no statements", async () => {
    const response = await request(app)
      .get("/api/statements")
      .query({ userId: "user-list-empty" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  it("returns all statements for the user sorted by newest period first", async () => {
    await request(app)
      .post("/api/statements")
      .send({
        userId: "user-list",
        month: 3,
        year: 2025,
        payments: samplePayments,
      });
    await request(app)
      .post("/api/statements")
      .send({
        userId: "user-list",
        month: 12,
        year: 2026,
        payments: samplePayments,
      });
    await request(app)
      .post("/api/statements")
      .send({
        userId: "user-list",
        month: 6,
        year: 2026,
        payments: samplePayments,
      });

    const response = await request(app)
      .get("/api/statements")
      .query({ userId: "user-list" });

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(3);
    expect(response.body.map((statement: { period: { month: number; year: number } }) => statement.period)).toEqual([
      { month: 12, year: 2026 },
      { month: 6, year: 2026 },
      { month: 3, year: 2025 },
    ]);
    expect(
      response.body.every(
        (statement: { userId: string; summary: unknown }) =>
          statement.userId === "user-list" && statement.summary,
      ),
    ).toBe(true);
  });

  it("does not include statements from other users", async () => {
    await request(app)
      .post("/api/statements")
      .send({
        userId: "user-list-a",
        month: 1,
        year: 2026,
        payments: samplePayments,
      });
    await request(app)
      .post("/api/statements")
      .send({
        userId: "user-list-b",
        month: 2,
        year: 2026,
        payments: samplePayments,
      });

    const response = await request(app)
      .get("/api/statements")
      .query({ userId: "user-list-a" });

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].userId).toBe("user-list-a");
  });

  it("returns 400 when userId is missing", async () => {
    const response = await request(app).get("/api/statements");

    expect(response.status).toBe(400);
  });
});

describe("GET /api/statements/:id", () => {
  const app = createApp();

  it("returns a statement with summary by id", async () => {
    const created = await request(app)
      .post("/api/statements")
      .send({
        userId: "user-get-by-id",
        month: 6,
        year: 2026,
        payments: samplePayments,
      });

    const response = await request(app).get(
      `/api/statements/${created.body.id}`,
    );

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      id: created.body.id,
      userId: "user-get-by-id",
      period: { month: 6, year: 2026 },
      summary: {
        status: "breathingRoom",
        netPosition: { amount: 110_000 },
      },
    });
    expect(response.body.summary.repaymentGuidance).toBeTruthy();
    expect(response.body.summary.whyAmISeeingThis).toBeTruthy();
  });

  it("returns 404 when the statement does not exist", async () => {
    const response = await request(app).get(
      "/api/statements/non-existent-id",
    );

    expect(response.status).toBe(404);
    expect(response.body.error).toBe("Statement not found");
  });
});
