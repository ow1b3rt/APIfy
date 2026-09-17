import * as t from "drizzle-orm/pg-core";

import { countries } from "../countries/countries.db.js";
import { pkid, timestamps } from "./helpers.js";

export const successProfiles = t.pgTable("success_profiles", {
  ...pkid,
  ...timestamps,

  name: t.varchar("name", { length: 255 }).notNull(),
  country: t.uuid("country").references(() => countries.id),

  content: t.text("content"),
});
