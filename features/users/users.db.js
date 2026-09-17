import { sql } from "drizzle-orm";
import {
  check,
  pgEnum,
  pgTable,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { pkid, timestamps } from "./helpers.js";
import { media } from "#/features/media/media.db.js";

export const userRole = pgEnum("user_role", ["admin", "editor", "author", "visitor"]);

export const users = pgTable(
  "users",
  {
    ...pkid,
    ...timestamps,

    name: varchar("name", {
      length: 255,
    }).notNull(),

    email: varchar("email", {
      length: 255,
    }).notNull(),

    password: varchar("password_hash", {
      length: 255,
    }),

    role: userRole("role").notNull().default("visitor"),

    avatar: uuid("avatar").references(() => media.id),
  },

  (table) => [
    uniqueIndex("users_email_unique").on(table.email),

    check("users_name_length_check", sql`length(trim(${table.name})) >= 2`),

    check("users_email_length_check", sql`length(trim(${table.email})) >= 5`),

    check(
      "users_password_hash_length_check",
      sql`length(${table.password}) >= 20`,
    ),
  ],
);
