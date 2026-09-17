import { Router } from "express";

import { authenticateUser, authorizePermissions } from "../../common/authentication/auth.js";
import {
  createUser,
  deleteUserController,
  getUser,
  getUsers,
  updateUserController,
} from "./users.controller.js";

const router = Router();
router.use(authenticateUser, authorizePermissions("admin"));
router.route("/").get(getUsers).post(createUser);
router.route("/:id").get(getUser).patch(updateUserController).delete(deleteUserController);

export default router;
