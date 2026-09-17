import * as t from "drizzle-orm/pg-core";

import { pkid, timestamps } from "./helpers.js";

export const countries = t.pgTable("countries", {
  ...pkid,
  ...timestamps,

  name: t.varchar("name", { length: 255 }).notNull(),
  slug: t.varchar("slug", { length: 255 }).notNull(),

  content: t.text("content"),
});
