import * as t from "drizzle-orm/pg-core";

import { pkid } from "./helpers.js";
import { timestamp } from "drizzle-orm/pg-core";

export const contacts = t.pgTable(
  "contacts",
  {
    ...pkid,

    name: t.varchar("name", { length: 255 }).notNull(),

    email: t.varchar("email", { length: 255 }).notNull(),

    phone: t.varchar("phone", { length: 10 }),

    message: t.text("message").notNull(),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    t.index("contacts_email_idx").on(table.email),
    t.index("contacts_created_at_idx").on(table.createdAt),
  ],
);
