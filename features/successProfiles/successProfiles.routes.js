import { Router } from "express";
import {
  commonCreateController,
  commonGetController,
  commonGetSingleController,
  commonUpdateController,
  commonDeleteController,
} from "../../common/feature/common.controller.js";
import { successProfiles } from "./successProfiles.db.js";

import { authenticateUser, authorizePermissions } from "../../common/authentication/auth.js";
import { insertSuccessProfileSchema, updateSuccessProfileSchema } from "./successProfiles.schema.js";

const router = Router();

router.route("/")
  .get((req, res) => commonGetController(req, res, successProfiles))
  .post(authenticateUser, authorizePermissions("admin"), (req, res) =>
    commonCreateController(req, res, successProfiles, insertSuccessProfileSchema),
  );

router.route("/:id")
  .get((req, res) => commonGetSingleController(req, res, successProfiles));

router.route("/:id")
  .all(authenticateUser, authorizePermissions('admin'))
  .patch((req, res) => commonUpdateController(req, res, successProfiles, updateSuccessProfileSchema))
  .delete((req, res) => commonDeleteController(req, res, successProfiles));

export default router;
