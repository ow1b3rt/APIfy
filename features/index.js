import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { Router } from "express";

const router = Router();
const featuresDirectory = path.dirname(fileURLToPath(import.meta.url));
const routeFilePattern = /(?:\.routes|_routes|^routes)\.js$/;
let loadPromise;

function findRouteFile(featureDirectory) {
  const matches = fs
    .readdirSync(featureDirectory, { withFileTypes: true })
    .filter((entry) => entry.isFile() && routeFilePattern.test(entry.name))
    .map((entry) => entry.name)
    .sort();

  if (matches.length > 1) {
    throw new Error(
      `Feature ${path.basename(featureDirectory)} has multiple route files: ${matches.join(", ")}`,
    );
  }

  return matches[0] ? path.join(featureDirectory, matches[0]) : null;
}

async function discoverFeatureRoutes() {
  const features = fs
    .readdirSync(featuresDirectory, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith("."))
    .sort((left, right) => left.name.localeCompare(right.name));

  for (const feature of features) {
    const routeFile = findRouteFile(path.join(featuresDirectory, feature.name));
    if (!routeFile) continue;

    const routeModule = await import(pathToFileURL(routeFile).href);
    const featureRouter = routeModule.default;

    if (typeof featureRouter !== "function") {
      throw new TypeError(`${routeFile} must default-export an Express router`);
    }

    const basePath = routeModule.basePath ?? `/${feature.name}`;
    if (!/^\/[a-z0-9/_-]*$/i.test(basePath)) {
      throw new TypeError(`${routeFile} exports an invalid basePath: ${basePath}`);
    }

    router.use(basePath, featureRouter);
  }

  return router;
}

export function loadFeatureRoutes() {
  loadPromise ??= discoverFeatureRoutes();
  return loadPromise;
}

export default router;
