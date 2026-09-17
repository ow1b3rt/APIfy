import { asc, count, eq, ilike, or, sql } from "drizzle-orm";

import { db } from "../../config/db.js";
import { users } from "./users.db.js";

const publicColumns = {
  id: users.id,
  name: users.name,
  email: users.email,
  role: users.role,
  avatar: users.avatar,
  createdAt: users.createdAt,
  updatedAt: users.updatedAt,
};

export async function findUserByEmail(email) {
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return user ?? null;
}

export async function findUserById(id) {
  const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return user ?? null;
}

export async function findPublicUserById(id) {
  const [user] = await db.select(publicColumns).from(users).where(eq(users.id, id)).limit(1);
  return user ?? null;
}

export async function createUser(data, executor = db) {
  const [user] = await executor.insert(users).values(data).returning(publicColumns);
  return user;
}

export async function deleteUser(id) {
  const [user] = await db.delete(users).where(eq(users.id, id)).returning(publicColumns);
  return user ?? null;
}

export async function findAllUsers({ search, role, page = 1, pageSize } = {}) {
  const conditions = [];
  if (search) conditions.push(or(ilike(users.name, `%${search}%`), ilike(users.email, `%${search}%`)));
  if (role) conditions.push(eq(users.role, role));
  const where = conditions.length ? sql.join(conditions, sql` AND `) : undefined;
  const parsedPage = Math.max(1, Number.parseInt(page, 10) || 1);
  const parsedPageSize = pageSize ? Math.min(100, Math.max(1, Number.parseInt(pageSize, 10) || 20)) : null;

  let query = db.select(publicColumns).from(users).where(where).orderBy(asc(users.name));
  if (parsedPageSize) query = query.limit(parsedPageSize).offset((parsedPage - 1) * parsedPageSize);

  const [items, totalRows] = await Promise.all([
    query,
    db.select({ value: count() }).from(users).where(where),
  ]);
  const total = Number(totalRows[0]?.value ?? 0);

  return {
    items,
    total,
    page: parsedPageSize ? parsedPage : 1,
    pageSize: parsedPageSize ?? total,
    totalPages: parsedPageSize ? Math.ceil(total / parsedPageSize) : (total ? 1 : 0),
  };
}

export async function updateUser(id, data) {
  const [user] = await db
    .update(users)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(users.id, id))
    .returning(publicColumns);
  return user ?? null;
}
