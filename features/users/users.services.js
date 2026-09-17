import bcrypt from "bcryptjs";
import { StatusCodes } from "http-status-codes";

import HttpError from "../../common/errors/HttpError.js";
import { comparator } from "../../common/utils/patcher.js";
import {
  createUser,
  deleteUser,
  findAllUsers,
  findPublicUserById,
  findUserByEmail,
  findUserById,
  updateUser,
} from "./users.repository.js";

export async function createUserService(data, executor) {
  if (await findUserByEmail(data.email)) {
    throw new HttpError("Email is already registered", StatusCodes.CONFLICT);
  }

  return createUser({
    ...data,
    password: await bcrypt.hash(data.password, 12),
  }, executor);
}

export async function deleteUserService(actor, id) {
  const user = await findUserById(id);
  if (!user) throw new HttpError("User not found", StatusCodes.NOT_FOUND);
  if (user.role === "admin") {
    throw new HttpError("Admin users cannot be deleted through this endpoint", StatusCodes.FORBIDDEN);
  }
  if (actor.id === id) {
    throw new HttpError("You cannot delete your own account here", StatusCodes.FORBIDDEN);
  }
  return deleteUser(id);
}

export async function updateUserService(id, userData) {
  const existing = await findUserById(id);
  if (!existing) throw new HttpError(`User with id ${id} does not exist`, StatusCodes.NOT_FOUND);
  if (existing.role === "admin") {
    throw new HttpError("Admin users cannot be modified through this endpoint", StatusCodes.FORBIDDEN);
  }

  const changes = comparator(existing, userData);
  if (changes.password) changes.password = await bcrypt.hash(changes.password, 12);
  if (Object.keys(changes).length === 0) return findPublicUserById(id);
  return updateUser(id, changes);
}

export function getUsersService(query) {
  return findAllUsers(query);
}

export async function getUserService(id) {
  const user = await findPublicUserById(id);
  if (!user) throw new HttpError("User not found", StatusCodes.NOT_FOUND);
  return user;
}
