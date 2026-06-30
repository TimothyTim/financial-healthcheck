import cors from "cors";
import express, { type Express } from "express";
import { healthRouter } from "./routes/health.js";
import { statementsRouter } from "./routes/statements.js";

export function createApp(): Express {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use("/api", healthRouter);
  app.use("/api/statements", statementsRouter);

  return app;
}
