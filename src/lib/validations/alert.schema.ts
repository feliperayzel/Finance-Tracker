import { z } from "zod";

export const alertSchema = z.object({
  email: z.string().email("Invalid email address"),
  frequency: z.enum(["weekly", "biweekly", "monthly"]),
});

export type AlertFormData = z.infer<typeof alertSchema>;
