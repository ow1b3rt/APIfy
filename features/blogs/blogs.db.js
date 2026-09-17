import * as t from "drizzle-orm/pg-core";

import { authors } from "#/features/authors/authors.db.js";
import { pkid, timestamps } from "./helpers.js";
import { media } from "#/features/media/media.db.js";

export const blogStatus = t.pgEnum(
  "blog_status",
  ["draft", "published"]
);

export const blogs = t.pgTable(
  "blogs",
  {
    ...pkid,

    ...timestamps,

    publishedAt: t.timestamp(
      "published_at",
      {
        withTimezone: true,
      }
    ),

    title: t
      .varchar("title", {
        length: 255,
      })
      .notNull(),

    slug: t
      .varchar("slug", {
        length: 255,
      })
      .notNull(),

    content: t
      .text("content")
      .notNull()
      .default(""),

    thumbnail: t
      .uuid("thumbnail")
      .references(() => media.id),

    authorId: t
      .uuid("author_id")
      .notNull()
      .references(() => authors.id),

    viewCount: t
      .integer("view_count")
      .notNull()
      .default(0),

    status: blogStatus("status")
      .notNull()
      .default("draft"),

    metaTitle: t.varchar(
      "meta_title",
      {
        length: 255,
      }
    ),

    metaDescription: t.varchar(
      "meta_description",
      {
        length: 300,
      }
    ),

    canonicalUrl: t.varchar(
      "canonical_url",
      {
        length: 500,
      }
    ),

    ogTitle: t.varchar(
      "og_title",
      {
        length: 255,
      }
    ),

    ogDescription: t.varchar(
      "og_description",
      {
        length: 300,
      }
    ),

    schema: t.text("schema"),

    redirectUrl: t.text(
      "redirect_url"
    ),
  },

  (table) => [
    t.uniqueIndex(
      "blogs_slug_unique"
    ).on(table.slug),

    t.index(
      "blogs_author_id_idx"
    ).on(table.authorId),

    t.index(
      "blogs_status_idx"
    ).on(table.status),

    t.index(
      "blogs_created_at_idx"
    ).on(table.createdAt),
  ]
);