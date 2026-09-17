/* classes.routes.js */

import { Router } from "express";
import { authenticateUser, authorizePermissions } from "../../common/authentication/auth.js";
import * as c from "#/common/feature/common.controller.js";
import { classes } from "#/db/schema/index.js";
import { createClassSchema, updateClassSchema } from "./classes.schema.js";

const router = Router();

// Public route - get all classes
router.route("/")
  .get((req, res) => c.commonGetController(req, res, classes))
  .post(authenticateUser, authorizePermissions('admin'), (req, res) => c.commonCreateController(req, res, classes, createClassSchema));

router.route("/:id")
  .get((req, res) => c.commonGetSingleController(req, res, classes));

router.route("/:id")
  .all(authenticateUser, authorizePermissions("admin"))
  .patch((req, res) => c.commonUpdateController(req, res, classes, updateClassSchema))
  .delete((req, res) => c.commonDeleteController(req, res, classes));

export default router;
