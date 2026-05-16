import { z } from "zod";

export const personSchema = z.object({
  name: z.string().min(1, "Name is required").max(80, "Name too long"),
});

export type PersonFormData = z.infer<typeof personSchema>;
