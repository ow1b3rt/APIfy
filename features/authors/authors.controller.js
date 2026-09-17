import { createUserSchema } from "../users/users.schema.js";
import { createUserService } from "../users/users.services.js";
import { insertAuthorSchema, updateAuthorSchema } from "./authors.schema.js";
import HttpError from "../../common/errors/HttpError.js";
import { StatusCodes } from "http-status-codes";
import { commonDeleteService, commonGetSingleService } from "../../common/feature/common.services.js";
import { authors, users } from "../../db/schema/index.js";
import { updateAuthorService } from "./authors.services.js";
import { parseBody } from "../../common/utils/parse.js";
import { db } from "../../config/db.js";


export async function createAuthorController(req, res) {
  const userData = parseBody(createUserSchema, { ...req.body, role: "author" });

  const { user, author } = await db.transaction(async (tx) => {
    const createdUser = await createUserService(userData, tx);
    const authorData = parseBody(insertAuthorSchema, { ...req.body, userId: createdUser.id });
    const [createdAuthor] = await tx.insert(authors).values(authorData).returning();
    return { user: createdUser, author: createdAuthor };
  });

  res.status(StatusCodes.CREATED).json({
    success: true,
    author: {
      name: user.name,
      email: user.email,
      role: user.role,
      ...author,
    }
  });
}

export async function updateAuthorController(req, res) {
  const { id } = req.params;

  const result = await updateAuthorService(id, req.body);

  res.status(StatusCodes.OK).json({
    success: true,
    ...result
  });
}

export async function deleteAuthorController(req, res) {
  const { id } = req.params;

  const author = await commonGetSingleService(authors, id);
  const user = await commonGetSingleService(users, author.userId);

  if (!user || user.role !== "author") {
    throw new HttpError("User not found or not an author", StatusCodes.NOT_FOUND);
  }

  await commonDeleteService(users, user.id);

  res.status(StatusCodes.OK).json({
    success: true,
    message: `Author with id ${id} and associated user deleted successfully`
  });
}
