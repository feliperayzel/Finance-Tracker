import { z } from "zod";

export const transactionSchema = z.object({
  type: z.enum(["expense", "income"]),
  value: z.coerce.number().positive("Value must be positive"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  category_id: z.string().uuid("Select a category"),
  person_id: z.string().uuid("Select a person"),
  description: z.string().max(500).optional().or(z.literal("")),
  installments: z.coerce.number().int().min(1).max(60).default(1),
});

export type TransactionFormData = z.infer<typeof transactionSchema>;
