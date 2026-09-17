import * as t from "drizzle-orm/pg-core";
import { pkid, timestamps } from "./helpers.js";
import { media } from "#/features/media/media.db.js";
import { jobs } from "#/features/jobs/jobs.db.js";

export const Statusenum = t.pgEnum("career_status", [
  "pending",
  "shortlisted",
  "interviewed",
  "hired",
  "rejected",
]);

export const careers = t.pgTable("careers", {
  ...pkid,
  ...timestamps,

  full_name: t.varchar("full_name", { length: 255 }).notNull(),
  email: t.varchar("email", { length: 255 }).notNull(),
  phone: t.varchar("phone", { length: 15 }).notNull(),
  job_id: t
    .uuid("job_id")
    .notNull()
    .references(() => jobs.id),
  resume: t
    .uuid("resume")
    .notNull()
    .references(() => media.id),
  description: t.text("description").notNull(),
  portfolio: t.varchar("portfolio", { length: 255 }),
  status: Statusenum("status").notNull().default("pending"),
});
