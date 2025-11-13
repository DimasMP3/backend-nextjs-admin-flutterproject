import { z } from "zod";

const EnvSchema = z.object({
  DATABASE_URL: z.string().url({ message: "DATABASE_URL must be a valid URL" }),
});

export const env = EnvSchema.safeParse({
  DATABASE_URL: process.env.DATABASE_URL,
});

if (!env.success) {
  console.warn("Invalid env configuration:", env.error.flatten().fieldErrors);
}

