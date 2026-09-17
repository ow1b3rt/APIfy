import * as t from "drizzle-orm/pg-core";

import { pkid, timestamps } from "./helpers.js";

export const qualificationTypes = t.pgEnum("qualification_types", [
 "SEE",
 "+2",
 "Bachelor's",
 "Master's"
]);

export const students = t.pgTable("students", {
  ...pkid,
  ...timestamps,

  name: t
    .varchar("name", {
      length: 255,
    })
    .notNull(),

  email: t
    .varchar("email", {
      length: 255,
    })
    .notNull()
    .unique(),

  phone: t
    .varchar("phone", {
      length: 20,
    })
    .notNull(),

  dob: t.varchar("dob", {
    length: 50,
  }),

  location: t.varchar("location", {
    length: 255,
  }),

  gpa: t
    .numeric("gpa", { precision: 3, scale: 2, mode: "number" })
    .notNull()
    .default(0),

  qualification: qualificationTypes("qualification"),
});
