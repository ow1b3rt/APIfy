import { StatusCodes } from "http-status-codes";

import { parseBody } from "../../common/utils/parse.js";
import { createUserSchema, updateUserSchema, userIdSchema } from "./users.schema.js";
import {
  createUserService,
  deleteUserService,
  getUserService,
  getUsersService,
  updateUserService,
} from "./users.services.js";

export async function createUser(req, res) {
  const user = await createUserService(parseBody(createUserSchema, req.body));
  res.status(StatusCodes.CREATED).json({ success: true, message: "User created successfully", user });
}

export async function updateUserController(req, res) {
  const { id } = parseBody(userIdSchema, req.params);
  const user = await updateUserService(id, parseBody(updateUserSchema, req.body));
  res.status(StatusCodes.OK).json({ success: true, message: "User updated successfully", user });
}

export async function deleteUserController(req, res) {
  const { id } = parseBody(userIdSchema, req.params);
  await deleteUserService(req.user, id);
  res.status(StatusCodes.OK).json({ success: true, message: "User deleted successfully" });
}

export async function getUsers(req, res) {
  const result = await getUsersService(req.query);
  res.status(StatusCodes.OK).json({ success: true, ...result });
}

export async function getUser(req, res) {
  const { id } = parseBody(userIdSchema, req.params);
  res.status(StatusCodes.OK).json({ success: true, user: await getUserService(id) });
}
