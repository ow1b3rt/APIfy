import * as t from "drizzle-orm/pg-core";

import { pkid, timestamps } from "./helpers.js";

export const mediaTypes = t.pgEnum("media_types", [
  "image",
  "video",
  "pdf",
  "docx",
  "xlsx",
]);

export const media = t.pgTable("media", {
  ...pkid,
  ...timestamps,

  url: t.text("url").notNull(),
  alt: t.varchar("alt", { length: 300 }).notNull(),
  title: t.varchar("title", { length: 300 }).notNull(),

  type: mediaTypes("type").notNull().default("image"),
  caption: t.varchar("caption", { length: 255 }),
});
