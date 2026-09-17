import bcrypt from "bcryptjs";
import { and, eq } from "drizzle-orm";

import { db, pool } from "../config/db.js";
import { users } from "../features/users/users.db.js";

const [rawEmail, password] = process.argv.slice(2);
if (!rawEmail || !password || password.length < 8) {
  console.error("Usage: pnpm passwd <email> <password-with-at-least-8-characters>");
  process.exit(1);
}

try {
  const [user] = await db
    .update(users)
    .set({ password: await bcrypt.hash(password, 12), updatedAt: new Date() })
    .where(and(eq(users.email, rawEmail.trim().toLowerCase()), eq(users.role, "admin")))
    .returning({ email: users.email });

  if (!user) throw new Error("Admin user not found");
  console.log(`Password changed: ${user.email}`);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
