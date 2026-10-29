import { z } from "zod";

const EnvSchema = z.object({
  API_URL: z.url(),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

export const env = EnvSchema.parse({
  API_URL: process.env.API_URL,
  NODE_ENV: process.env.NODE_ENV,
});
