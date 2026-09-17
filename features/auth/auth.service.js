import bcrypt from "bcryptjs";
import { StatusCodes } from "http-status-codes";

import HttpError from "../../common/errors/HttpError.js";
import {
  createAccessToken,
  createRefreshToken,
  verifyRefreshToken,
} from "../../common/authentication/jwt.js";
import { findUserByEmail, findUserById } from "./auth.repository.js";

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  };
}

//================================================================================================================

export async function loginUser(data) {
  const user = await findUserByEmail(data.email);

  if (!user?.password || !(await bcrypt.compare(data.password, user.password))) {
    throw new HttpError("Invalid email or password", StatusCodes.UNAUTHORIZED);
  }

  return {
    user: publicUser(user),
    accessToken: createAccessToken(user),
    refreshToken: createRefreshToken(user),
  };
}

//================================================================================================================

export async function refreshSession(refreshToken) {
  let payload;

  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw new HttpError(
      "Invalid or expired refresh token",
      StatusCodes.UNAUTHORIZED,
    );
  }

  const user = await findUserById(payload.sub);

  if (!user) {
    throw new HttpError("User no longer exists", StatusCodes.UNAUTHORIZED);
  }

  return {
    accessToken: createAccessToken(user),
    refreshToken: createRefreshToken(user),
  };
}

//================================================================================================================

export async function getCurrentUser(id) {
  const user = await findUserById(id);

  if (!user) {
    throw new HttpError("User not found", StatusCodes.NOT_FOUND);
  }

  return publicUser(user);
}
