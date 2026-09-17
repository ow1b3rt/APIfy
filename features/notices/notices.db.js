import * as t from "drizzle-orm/pg-core";

import { pkid, timestamps } from "./helpers.js";
import { media } from "#/features/media/media.db.js";

export const notices = t.pgTable("notices", {
  ...pkid,
  ...timestamps,

  content: t.uuid("content").references(() => media.id),
  title: t.varchar("title", { length: 255 }).notNull(),
  slug: t.varchar("slug", { length: 255 }).notNull().unique(),
  description: t.text("description"),
});
