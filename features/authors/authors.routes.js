import { Router } from "express";
import { getTableColumns } from 'drizzle-orm'
import {
  commonGetController,
  commonGetSingleController,
  commonDeleteController,
} from "../../common/feature/common.controller.js";
import { authenticateUser, authorizePermissions } from "#/common/authentication/auth.js";
import { authors } from "./authors.db.js";
import { createAuthorController, updateAuthorController, deleteAuthorController } from "./authors.controller.js";
import { join } from "#/common/utils/queryhelper.js";
import { eq } from "drizzle-orm";
import { users } from "../users/users.db.js";

const router = Router();

router.route("/")
  .post(authenticateUser, authorizePermissions('admin'), createAuthorController)
  .get((req, res) => commonGetController(req, res,
    join(authors, users, {
      on: eq(authors.userId, users.id),
      name: 'authors',
      fields: {
        ...getTableColumns(authors),
        name: users.name,
        email: users.email,
        avatar: users.avatar,
      },
    }),
    [users.name, users.email],
  ));


router.route("/:id")
  .get((req, res) => commonGetSingleController(req, res,
    join(authors, users, {
      on: eq(authors.userId, users.id),
      name: 'authors',
      fields: {
        ...getTableColumns(authors),
        name: users.name,
        email: users.email,
        avatar: users.avatar,
      },
    }),
  ))
  .patch(authenticateUser, authorizePermissions('admin'), updateAuthorController)
  .delete(authenticateUser, authorizePermissions('admin'), deleteAuthorController);

export default router;
