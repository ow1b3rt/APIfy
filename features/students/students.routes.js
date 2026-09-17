import { Router } from "express";

import {
  authenticateUser,
  authorizePermissions,
} from "../../common/authentication/auth.js";
import {
  createStudent,
  getStudents,
  updateStudent,
  getSingleStudent,
  deleteStudent,
} from "./students.controller.js";

const router = Router();

router
  .route("/")
  .all(authenticateUser, authorizePermissions("admin"))
  .post(createStudent)
  .get(getStudents);

router
  .route("/:id")
  .all(authenticateUser, authorizePermissions("admin"))
  .get(getSingleStudent)
  .patch(updateStudent)
  .delete(deleteStudent);

export default router;
