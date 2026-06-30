import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../app.js";

describe("health routes", () => {
  const app = createApp();

  it("GET /api/health returns ok status", async () => {
    const response = await request(app).get("/api/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "ok" });
  });

  it("GET /api/healthcheck returns healthcheck result", async () => {
    const response = await request(app).get("/api/healthcheck");

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      id: expect.any(String),
      score: expect.any(Number),
      categories: {
        savings: expect.any(Number),
        debt: expect.any(Number),
        budget: expect.any(Number),
        investments: expect.any(Number),
      },
      createdAt: expect.any(String),
    });
  });
});
