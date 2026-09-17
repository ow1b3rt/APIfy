import { Router } from "express";
import { saveLayoutController, getLayoutController } from "./layouts.controller.js";
import { authenticateUser, authorizePermissions } from "../../common/authentication/auth.js";
const router = Router();

router.route("/:name")
  .get(getLayoutController)
  .post(authenticateUser, authorizePermissions("admin"), saveLayoutController);

export default router;
