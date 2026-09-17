import * as t from "drizzle-orm/pg-core";

import { pkid, timestamps } from "./helpers.js";

export const classes = t.pgTable(
  "classes",
  {
    ...pkid,
    ...timestamps,

    name: t
      .varchar("name", {
        length: 255,
      })
      .notNull(),

    startTime: t.time("start_time").notNull(), // e.g. "14:00:00"
    endTime: t.time("end_time").notNull(),
  },
  (table) => ({
    uniqueClass: t
      .unique("unique_class")
      .on(table.name, table.startTime, table.endTime),
  }),
);
