import type { HealthcheckResult } from "@financial-healthcheck/shared";
import { Router, type IRouter } from "express";

export const healthRouter: IRouter = Router();

const mockHealthcheck: HealthcheckResult = {
  id: "hc-001",
  score: 72,
  categories: {
    savings: 80,
    debt: 65,
    budget: 70,
    investments: 73,
  },
  createdAt: new Date().toISOString(),
};

healthRouter.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

healthRouter.get("/healthcheck", (_req, res) => {
  res.json(mockHealthcheck);
});
