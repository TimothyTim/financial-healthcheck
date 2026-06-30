import { Router, type IRouter } from "express";
import {
  createStatementSchema,
  listStatementsQuerySchema,
} from "../lib/validation.js";
import {
  DuplicateStatementError,
  statementsService,
} from "../services/statements.service.js";

export const statementsRouter: IRouter = Router();

statementsRouter.get("/", (req, res) => {
  const parsed = listStatementsQuerySchema.safeParse(req.query);

  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const statements = statementsService.listStatementsByUserId(parsed.data.userId);
  res.status(200).json(statements);
});

statementsRouter.post("/", (req, res) => {
  const parsed = createStatementSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  try {
    const statement = statementsService.createStatement(parsed.data);
    res.status(201).json(statement);
  } catch (error) {
    if (error instanceof DuplicateStatementError) {
      res.status(409).json({ error: error.message });
      return;
    }

    throw error;
  }
});
