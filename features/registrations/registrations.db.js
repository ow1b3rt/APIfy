import * as t from "drizzle-orm/pg-core";

import { pkid, timestamps } from "./helpers.js";
import { classes } from "../classes/classes.db.js";
import { students } from "../students/students.db.js";

export const registrationTypes = t.pgEnum("registration_type", [
  "physical",
  "online",
  "hybrid",

  "not_sure",
]);

export const registrations = t.pgTable(
  "registrations",
  {
    ...pkid,
    ...timestamps,

    classId: t
      .uuid("class_id")
      .references(() => classes.id, { onDelete: "cascade" }),
    studentId: t
      .uuid("student_id")
      .references(() => students.id, { onDelete: "cascade" }),
    type: registrationTypes("type").notNull().default("physical"),
    remarks: t.text("remarks"),
  },

  (table) => ({
    studentClassUnique: t.unique().on(table.studentId, table.classId),
  }),
);
