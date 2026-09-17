import { Router } from "express";
import {
  commonGetController,
  commonGetSingleController,
  commonCreateController,
  commonUpdateController,
  commonDeleteController,
} from "../../common/feature/common.controller.js";
import {
  authenticateUser,
  authorizePermissions,
} from "../../common/authentication/auth.js";
import { partners } from "./partners.db.js";
import { insertPartnerSchema, updatePartnerSchema } from "./partners.schema.js";

const router = Router();

router
  .route("/")
  .post(authenticateUser, authorizePermissions('admin'), (req, res) =>
    commonCreateController(req, res, partners, insertPartnerSchema),
  )
  .get((req, res) => commonGetController(req, res, partners));

router
  .route("/:id")
  .get((req, res) => commonGetSingleController(req, res, partners));

router
  .route("/:id")
  .all(authenticateUser, authorizePermissions("admin"))
  .patch((req, res) =>
    commonUpdateController(req, res, partners, updatePartnerSchema),
  )
  .delete((req, res) => commonDeleteController(req, res, partners));

export default router;
