import jwt from "jsonwebtoken";

import { env } from "../../config/env.js";

export function createAccessToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
      tokenType: "access",
    },
    env.JWT_SECRET,
    { expiresIn: "15m" },
  );
}

export function createRefreshToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      tokenType: "refresh",
    },
    env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" },
  );
}

export function verifyAccessToken(token) {
  const payload = jwt.verify(token, env.JWT_SECRET);

  if (payload.tokenType !== "access") {
    throw new Error("Invalid token type");
  }

  return payload;
}

export function verifyRefreshToken(token) {
  const payload = jwt.verify(token, env.JWT_REFRESH_SECRET);

  if (payload.tokenType !== "refresh") {
    throw new Error("Invalid token type");
  }

  return payload;
}
