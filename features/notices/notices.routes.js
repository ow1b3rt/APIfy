import { Router } from "express";
import { createNoticeSchema } from "./notice.schema.js";
import { join } from "#/common/utils/queryhelper.js";
import { eq } from "drizzle-orm";
import { media, notices } from "#/db/schema/index.js";
import { getTableColumns } from "drizzle-orm";
import {
  commonCreateController,
  commonGetController,
  commonGetSingleController,
  commonGetSingleBySlugController,
} from "#/common/feature/common.controller.js";
import {
  createNoticeController,
  getNoticesController,
  getSingleNoticeController,
  deleteNoticeController,
  updateNoticeController,
} from "./notice.controller.js";
import {
  authenticateUser,
  authorizePermissions,
} from "#/common/authentication/auth.js";

const router = Router();

router
  .route("/")
  .get((req, res) =>
    commonGetController(
      req,
      res,
      join(notices, media, {
        on: eq(notices.content, media.id),
        name: "notices",
        fields: {
          ...getTableColumns(notices),
          mediaUrl: media.url,
          mediaType: media.type,
        },
        type: "left",
      }),
    ),
  )
  .post(authenticateUser, authorizePermissions("admin"), (req, res) =>
    commonCreateController(req, res, notices, createNoticeSchema),
  );

router.route("/:id").get((req, res) =>
  commonGetSingleController(
    req,
    res,
    join(notices, media, {
      on: eq(notices.content, media.id),
      name: "notices",
      fields: {
        ...getTableColumns(notices),
        mediaUrl: media.url,
        mediaType: media.type,
      },
      type: "left",
    }),
  ),
);

router.route("/slug/:slug").get((req, res) =>
  commonGetSingleBySlugController(
    req,
    res,
    join(notices, media, {
      on: eq(notices.content, media.id),
      name: "notices",
      fields: {
        ...getTableColumns(notices),
        mediaUrl: media.url,
        mediaType: media.type,
      },
      type: "left",
    }),
  ),
);

router
  .route("/:id")
  .all(authenticateUser, authorizePermissions("admin"))
  .patch(updateNoticeController)
  .delete(deleteNoticeController);

export default router;
