import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  pgEnum,
  index,
} from "drizzle-orm/pg-core";

export const purposeOfVisitEnum = pgEnum("purpose_of_visit", [
  "ielts_pte_study",
  "japanese_language_study",
  "abroad_study",
  "mock_test",
  "ssw",
  "duolingo",
]);

export const visitors = pgTable(
  "visitors",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 100 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    phone: varchar("phone", { length: 20 }).notNull(),
    purposeOfVisit: purposeOfVisitEnum("purpose_of_visit").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    index("visitors_email_idx").on(table.email),

    index("visitors_purpose_of_visit_idx").on(table.purposeOfVisit),
    index("visitors_created_at_idx").on(table.createdAt),
  ],
);
