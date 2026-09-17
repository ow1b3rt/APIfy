import { Router } from "express";
import {
    authenticateUser,
    authorizePermissions,
} from "../../common/authentication/auth.js";
import {
    commonGetController,
    commonGetSingleController,
} from "../../common/feature/common.controller.js";
import { media } from "../../db/schema/index.js";
import upload from "./media.middleware.js";
import { createMediaController } from "./media.controller.js";

const router = Router();

router
    .route("/")
    .all(authenticateUser, authorizePermissions("author", "admin", "editor"))
    .get((req, res) =>
        commonGetController(
            req,
            res,
            media,
            [media.title, media.caption],
            undefined,
            ["type"],
        ),
    )
    .post(
        upload.fields([
            { name: "profilePics", maxCount: 1 },
            { name: "thumbnails", maxCount: 1 },
            { name: "documents", maxCount: 1 },
            { name: "media", maxCount: 1 },
        ]),
        createMediaController,
    );

router
    .route("/:id")
    .get((req, res) => commonGetSingleController(req, res, media));

export default router;
