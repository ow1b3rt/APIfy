import app from "./app.js";
import { pool } from "./config/db.js";
import { env } from "./config/env.js";
import { loadFeatureRoutes } from "./features/index.js";

await loadFeatureRoutes();

const server = app.listen(env.PORT, () => {
  console.log(`Server running on port ${env.PORT}`);
});

async function shutdown(signal) {
  console.log(`${signal} received; shutting down`);
  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
