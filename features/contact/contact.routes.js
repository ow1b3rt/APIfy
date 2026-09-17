import { Router } from "express";

import {
  commonCreateController,
  commonDeleteController,
  commonGetController,
  commonGetSingleController,
} from "../../common/feature/common.controller.js";
import { contacts } from "#/db/schema/index.js";
import { insertContactSchema } from "./contact.schema.js";

import {
  authenticateUser,
  authorizePermissions,
} from "#/common/authentication/auth.js";

export const router = Router();

router
  .route("/")
  .post((req, res) =>
    commonCreateController(req, res, contacts, insertContactSchema),
  );

router
  .route("/")
  .all(authenticateUser, authorizePermissions("admin"))
  .get((req, res) => commonGetController(req, res, contacts));

router
  .route("/:id")
  .all(authenticateUser, authorizePermissions("admin"))
  .get((req, res) => commonGetSingleController(req, res, contacts))
  .delete((req, res) => commonDeleteController(req, res, contacts));

export default router;
