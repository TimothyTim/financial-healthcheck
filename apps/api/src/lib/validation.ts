import { z } from "zod";

export const createStatementSchema = z.object({
  userId: z.string().min(1),
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2000).max(2100),
});

export const listStatementsQuerySchema = z.object({
  userId: z.string().min(1),
});
