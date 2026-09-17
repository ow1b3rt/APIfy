import "dotenv/config";

import { z } from "zod";

const booleanString = z
  .enum(["true", "false"])
  .default("false")
  .transform((value) => value === "true");

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().min(1).max(65_535).default(5000),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
  JWT_REFRESH_SECRET: z.string().min(32, "JWT_REFRESH_SECRET must be at least 32 characters"),
  COOKIE_SECRET: z.string().min(32, "COOKIE_SECRET must be at least 32 characters"),
  CLIENT_URL: z.url().optional(),
  DOMAIN_NAME: z.url().optional(),
  CORS_ORIGINS: z.string().optional(),
  TRUST_PROXY: booleanString,
  COOKIE_SAME_SITE: z.enum(["lax", "strict", "none"]).default("lax"),
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
  console.error("Invalid environment variables:", result.error.flatten().fieldErrors);
  throw new Error("Environment validation failed");
}

const values = result.data;
const configuredOrigins = (values.CORS_ORIGINS ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

export const env = {
  ...values,
  ALLOWED_ORIGINS: [...new Set([
    ...configuredOrigins,
    values.CLIENT_URL,
    values.DOMAIN_NAME,
  ].filter(Boolean))],
};
