import { commonFindById, commonUpdate } from "../../common/feature/common.repository.js";
import { comparator } from "../../common/utils/patcher.js";
import { authors } from "#/features/authors/authors.db.js";
import { updateUserSchema } from "../users/users.schema.js";
import { updateUserService } from "../users/users.services.js";
import HttpError from "#/common/errors/HttpError.js";
import { StatusCodes } from "http-status-codes";
import { emptyObject } from "#/common/utils/objectutils.js";
import { updateAuthorSchema } from "./authors.schema.js";
import { parseBody } from '#/common/utils/parse.js';


export async function updateAuthorService(id, data) {
  const existingAuthor = await commonFindById(authors, id)

  if (!existingAuthor) {
      throw new HttpError(`Author with id ${id} does not exist`, StatusCodes.NOT_FOUND)
  }

  const authorData = parseBody(updateAuthorSchema, data)

  const changes = comparator(existingAuthor, authorData)
  const updatedAuthor = emptyObject(changes) ? existingAuthor : await commonUpdate(authors, id, changes)

  const userFields = ["name", "email", "password", "avatar"];
  const rawUserData = Object.fromEntries(
    Object.entries(data).filter(([key]) => userFields.includes(key)),
  );
  const updatedUser = emptyObject(rawUserData)
    ? undefined
    : await updateUserService(
        existingAuthor.userId,
        parseBody(updateUserSchema, rawUserData),
      );

  return { author: updatedAuthor, ...(updatedUser ? { user: updatedUser } : {}) }
}
