import { defineConfig } from "drizzle-kit";

import { env } from "./config/env.js";

export default defineConfig({
  schema: "./features/**/*.db.js",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: env.DATABASE_URL,
  },
});
