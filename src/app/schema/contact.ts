import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  phoneNumber: z
    .string()
    .min(10, { message: "Phone number must be at least 10 digits" }),
  relationship: z.string().min(1, { message: "Please select a relationship" }),
});

export type ContactFormData = z.infer<typeof contactSchema>;
