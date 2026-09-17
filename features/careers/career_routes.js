import {Router } from "express";

import{

    createCareerController,
    getCareerController,
    deleteCareerController,
    updateCareerController,
    getSingleCareerController,


} 
from "./career_controller.js";

import {
    authenticateUser,
    authorizePermissions,
} from "#/common/authentication/auth.js";
import upload from "#/features/media/media.middleware.js";

export const router= Router()

router
  .route("/")
  .post(
    upload.fields([{ name: "resume", maxCount: 1 }]),
    createCareerController,
  )
  .get(authenticateUser, authorizePermissions("admin"), getCareerController);


router.route("/:id")
.get(authenticateUser,authorizePermissions('admin'),getSingleCareerController)
.patch(authenticateUser,authorizePermissions('admin'),updateCareerController)
.delete(authenticateUser,authorizePermissions('admin'),deleteCareerController)


export default router
