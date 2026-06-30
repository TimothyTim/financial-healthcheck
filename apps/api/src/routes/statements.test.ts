import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../app.js";

describe("POST /api/statements", () => {
  const app = createApp();

  it("creates a statement with userId, period, empty payments, and zero summary", async () => {
    const response = await request(app)
      .post("/api/statements")
      .send({ userId: "user-create", month: 6, year: 2026 });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      userId: "user-create",
      period: { month: 6, year: 2026 },
      payments: [],
      summary: {
        totalIncome: { amount: 0 },
        totalExpenses: { amount: 0 },
        totalDebtRepayments: { amount: 0 },
        netPosition: { amount: 0 },
      },
    });
    expect(response.body.id).toBeTruthy();
    expect(response.body.createdAt).toBeTruthy();
    expect(response.body.updatedAt).toBeTruthy();
  });

  it("returns 409 for duplicate userId + period", async () => {
    const payload = { userId: "user-dup", month: 7, year: 2026 };

    await request(app).post("/api/statements").send(payload);

    const response = await request(app).post("/api/statements").send(payload);

    expect(response.status).toBe(409);
    expect(response.body.error).toContain("user-dup");
  });

  it("allows the same period for different users", async () => {
    const response = await request(app)
      .post("/api/statements")
      .send({ userId: "user-b", month: 8, year: 2026 });

    expect(response.status).toBe(201);
    expect(response.body.userId).toBe("user-b");
  });

  it("returns 400 when userId is missing", async () => {
    const response = await request(app)
      .post("/api/statements")
      .send({ month: 6, year: 2026 });

    expect(response.status).toBe(400);
  });

  it("returns 400 for invalid month", async () => {
    const response = await request(app)
      .post("/api/statements")
      .send({ userId: "user-invalid", month: 13, year: 2026 });

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
      .send({ userId: "user-list", month: 3, year: 2025 });
    await request(app)
      .post("/api/statements")
      .send({ userId: "user-list", month: 12, year: 2026 });
    await request(app)
      .post("/api/statements")
      .send({ userId: "user-list", month: 6, year: 2026 });

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
      .send({ userId: "user-list-a", month: 1, year: 2026 });
    await request(app)
      .post("/api/statements")
      .send({ userId: "user-list-b", month: 2, year: 2026 });

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
