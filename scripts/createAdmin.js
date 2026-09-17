import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

import { db, pool } from "../config/db.js";
import { authors } from "../features/authors/authors.db.js";
import { users } from "../features/users/users.db.js";

const [rawEmail, password] = process.argv.slice(2);
if (!rawEmail || !password || password.length < 8) {
  console.error("Usage: pnpm newadmin <email> <password-with-at-least-8-characters>");
  process.exit(1);
}

const email = rawEmail.trim().toLowerCase();

try {
  const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  if (existing) throw new Error("A user with this email already exists");

  const result = await db.transaction(async (tx) => {
    const [user] = await tx.insert(users).values({
      name: "Admin",
      email,
      password: await bcrypt.hash(password, 12),
      role: "admin",
    }).returning({ id: users.id, email: users.email, role: users.role });

    await tx.insert(authors).values({ userId: user.id, bio: "Administrator" });
    return user;
  });

  console.log(`Admin created: ${result.email}`);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
