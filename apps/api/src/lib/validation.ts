import { z } from "zod";

const createPaymentSchema = z.object({
  type: z.enum(["income", "expense", "debtRepayment"]),
  label: z.string().trim().min(1),
  amount: z.object({ amount: z.number().int().positive() }),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
});

export const createStatementSchema = z
  .object({
    userId: z.string().min(1),
    month: z.number().int().min(1).max(12),
    year: z.number().int().min(2000).max(2100),
    payments: z.array(createPaymentSchema).min(1),
  })
  .superRefine((data, ctx) => {
    for (const type of ["income", "expense", "debtRepayment"] as const) {
      if (!data.payments.some((payment) => payment.type === type)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `At least one ${type} payment is required`,
          path: ["payments"],
        });
      }
    }
  });

export const listStatementsQuerySchema = z.object({
  userId: z.string().min(1),
});

export const statementIdParamsSchema = z.object({
  id: z.string().min(1),
});
