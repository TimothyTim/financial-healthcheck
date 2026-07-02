import { Router, type IRouter } from "express";
import {
  createStatementSchema,
  listStatementsQuerySchema,
  statementIdParamsSchema,
  updateStatementSchema,
} from "../lib/validation.js";
import {
  DuplicateStatementError,
  StatementNotFoundError,
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

statementsRouter.get("/:id", (req, res) => {
  const parsed = statementIdParamsSchema.safeParse(req.params);

  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const statement = statementsService.getStatementById(parsed.data.id);

  if (!statement) {
    res.status(404).json({ error: "Statement not found" });
    return;
  }

  res.status(200).json(statement);
});

statementsRouter.patch("/:id", (req, res) => {
  const paramsParsed = statementIdParamsSchema.safeParse(req.params);

  if (!paramsParsed.success) {
    res.status(400).json({ error: paramsParsed.error.flatten() });
    return;
  }

  const bodyParsed = updateStatementSchema.safeParse(req.body);

  if (!bodyParsed.success) {
    res.status(400).json({ error: bodyParsed.error.flatten() });
    return;
  }

  try {
    const statement = statementsService.updateStatement(
      paramsParsed.data.id,
      bodyParsed.data,
    );
    res.status(200).json(statement);
  } catch (error) {
    if (error instanceof StatementNotFoundError) {
      res.status(404).json({ error: "Statement not found" });
      return;
    }

    if (error instanceof DuplicateStatementError) {
      res.status(409).json({ error: error.message });
      return;
    }

    throw error;
  }
});
