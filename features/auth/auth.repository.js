import { eq } from "drizzle-orm";

import { db } from "../../config/db.js";
import { users } from "#/features/users/users.db.js";

export async function findUserByEmail(email) {
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return user;
}

export async function findUserById(id) {
  const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return user;
}
