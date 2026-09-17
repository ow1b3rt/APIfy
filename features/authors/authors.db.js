import * as t from "drizzle-orm/pg-core";

import { pkid, timestamps } from "./helpers.js";
import { users } from "#/features/users/users.db.js";

export const authors = t.pgTable("authors", {
  ...pkid,
  ...timestamps,

  userId: t
    .uuid("user_id")
    .notNull()
    .unique()
    .references(() => users.id, {
      onDelete: "cascade",
    }),

  bio: t.text(),

  facebookUrl: t.text("facebook_url"),
  linkedinUrl: t.text("linkedin_url"),
  youtubeUrl: t.text("youtube_url"),
  instagramUrl: t.text("instagram_url"),
  twitterUrl: t.text("twitter_url"),
  tiktokUrl: t.text("tiktok_url"),
});