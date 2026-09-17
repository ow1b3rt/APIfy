import * as t from "drizzle-orm/pg-core";
import { pkid, timestamps } from "./helpers.js";
import { media } from "../media/media.db.js";

export const partnerStatusEnum = t.pgEnum("partner_status", [
  "pending",
  "approved",
  "rejected",
]);

export const partners = t.pgTable(
  "partners",
  {
    ...pkid,
    ...timestamps,

    name: t.varchar("name", { length: 255 }).notNull(),
    email: t.varchar("email", { length: 255 }).notNull(),
    phone: t.varchar("phone", { length: 20 }).notNull(),
    location: t.varchar("location", { length: 255 }), // "City, Country"
    organizationName: t.varchar("organization_name", { length: 255 }),

    partnerType: t.varchar("partner_type", { length: 255 }),

    website: t.varchar("website", { length: 500 }),

    partnershipInterest: t.varchar("partnership_interest", { length: 255 }),

    yearsOfExperience: t.varchar("years_of_experience", { length: 255 }),

    proposal: t.text("proposal"),

    status: partnerStatusEnum("status").notNull().default("pending"),

    logoId: t.uuid("logo_id").references(() => media.id),
  },
  (table) => ({
    emailIdx: t.index("partners_email_idx").on(table.email),
    statusIdx: t.index("partners_status_idx").on(table.status),
    createdAtIdx: t.index("partners_created_at_idx").on(table.createdAt),
  }),
);
