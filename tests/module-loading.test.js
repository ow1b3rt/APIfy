import assert from "node:assert/strict";
import test from "node:test";

test("all feature routes load", async () => {
  const { default: router, loadFeatureRoutes } = await import("../features/index.js");
  await loadFeatureRoutes();
  assert.ok(router.stack.length >= 15);
});

test("generated schema barrel exposes core tables", async () => {
  const schema = await import("../db/schema/index.js");
  for (const name of ["users", "authors", "blogs", "media", "students", "registrations"]) {
    assert.ok(schema[name], `missing schema export: ${name}`);
  }
});
