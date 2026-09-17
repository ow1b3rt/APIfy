import * as t from "drizzle-orm/pg-core";

import { pkid, timestamps } from "./helpers.js";
import { media } from "#/features/media/media.db.js";
import { sql } from "drizzle-orm";

export const events = t.pgTable("events", {
  ...pkid,
  ...timestamps,

  content: t.uuid("content").references(() => media.id),
  title: t.varchar("title", { length: 255 }).notNull(),
  slug: t
    .varchar("slug", { length: 255 })
    .notNull()
    .generatedAlwaysAs(
      sql`lower(regexp_replace(regexp_replace(title, '[^a-zA-Z0-9\\s-]', '', 'g'), '\\s+', '-', 'g'))`,
    )
    .unique(),
  description: t.text("description"),
});
