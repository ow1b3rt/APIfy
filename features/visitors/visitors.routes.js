import { Router } from "express";

import {
  commonCreateController,
  commonDeleteController,
  commonGetController,
  commonGetSingleController,
} from "../../common/feature/common.controller.js";
import { visitors } from "#/db/schema/index.js";
import { insertVisitorsSchema } from "./visitors.schema.js";

import {
  authenticateUser,
  authorizePermissions,
} from "#/common/authentication/auth.js";

export const router = Router();

router
  .route("/")
  .post((req, res) =>
    commonCreateController(req, res, visitors, insertVisitorsSchema),
  );

router
  .route("/")
  .all(authenticateUser, authorizePermissions("admin"))
  .get((req, res) => commonGetController(req, res, visitors));

router
  .route("/:id")
  .all(authenticateUser, authorizePermissions("admin"))
  .get((req, res) => commonGetSingleController(req, res, visitors))
  .delete((req, res) => commonDeleteController(req, res, visitors));

export default router;
