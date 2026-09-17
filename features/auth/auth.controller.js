import { StatusCodes } from "http-status-codes";

import HttpError from "../../common/errors/HttpError.js";
import { env } from "../../config/env.js";
import { loginSchema } from "./auth.schema.js";
import { getCurrentUser, loginUser, refreshSession } from "./auth.service.js";

const baseCookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === "production" || env.COOKIE_SAME_SITE === "none",
  sameSite: env.COOKIE_SAME_SITE,
  signed: true,
  path: "/",
};

function setAuthCookies(res, accessToken, refreshToken) {
  res.cookie("accessToken", accessToken, {
    ...baseCookieOptions,
    maxAge: 15 * 60 * 1000,
  });

  res.cookie("refreshToken", refreshToken, {
    ...baseCookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

function parseBody(schema, body) {
  const result = schema.safeParse(body);

  if (!result.success) {
    const message = result.error.issues[0]?.message || "Invalid request data";
    throw new HttpError(message, StatusCodes.BAD_REQUEST);
  }

  return result.data;
}

export async function login(req, res) {
  const data = parseBody(loginSchema, req.body);
  const result = await loginUser(data);

  setAuthCookies(res, result.accessToken, result.refreshToken);

  res.status(StatusCodes.OK).json({
    success: true,
    message: "Login successful",
    user: result.user,
  });
}

export async function refresh(req, res) {
  const refreshToken = req.signedCookies?.refreshToken;

  if (!refreshToken) {
    throw new HttpError("Refresh token is required", StatusCodes.UNAUTHORIZED);
  }

  const result = await refreshSession(refreshToken);
  setAuthCookies(res, result.accessToken, result.refreshToken);

  res.status(StatusCodes.OK).json({
    success: true,
    message: "Session refreshed",
  });
}

export async function logout(req, res) {
  res.clearCookie("accessToken", baseCookieOptions);
  res.clearCookie("refreshToken", baseCookieOptions);

  res.status(StatusCodes.OK).json({
    success: true,
    message: "Logout successful",
  });
}

export async function me(req, res) {
  const user = await getCurrentUser(req.user.id);

  res.status(StatusCodes.OK).json({
    success: true,
    user,
  });
}
