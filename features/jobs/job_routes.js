import { Router } from "express";

import {
  createJob,
  updateJob,
  getJobs,
  getSingleJob,
  deleteJob,
  getSingleJobBySlug,
} from "./job_controller.js";

import {
  authenticateUser,
  authorizePermissions,
} from "#/common/authentication/auth.js";

export const router = Router();

router
  .route("/")
  .get(getJobs)
  .post(authenticateUser, authorizePermissions("admin"), createJob);

router.route("/slug/:slug").get(getSingleJobBySlug);

router
  .route("/:id")
  .get(getSingleJob)
  .delete(authenticateUser, authorizePermissions("admin"), deleteJob)
  .patch(authenticateUser, authorizePermissions("admin"), updateJob);

export default router;
