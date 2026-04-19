import {
  pgTable,
  integer,
  varchar,
  char,
  timestamp,
  primaryKey,
  index,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  nim: varchar({ length: 8 }).notNull().unique(),
  email: varchar({ length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const families = pgTable(
  "families",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    name: varchar({ length: 255 }).notNull(),
    iconUrl: varchar("icon_url", { length: 255 }).notNull(),
    familyCode: char("family_code", { length: 6 }).notNull().unique(),
    createdBy: integer("created_by")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("idx_families_created_at").on(t.createdAt.desc())]
);

export const familyMemberships = pgTable(
  "family_memberships",
  {
    familyId: integer("family_id")
      .notNull()
      .references(() => families.id, { onDelete: "cascade" }),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    joinedAt: timestamp("joined_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    primaryKey({ columns: [t.familyId, t.userId] }),
    index("idx_family_memberships_user_id").on(t.userId),
    index("idx_family_memberships_family_id").on(t.familyId),
  ]
);

export const livestreamSessions = pgTable(
  "livestream_sessions",
  {
    streamId: varchar("stream_id", { length: 64 }).primaryKey(),
    familyId: integer("family_id")
      .notNull()
      .references(() => families.id, { onDelete: "cascade" }),
    hostUserId: integer("host_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    hostDisplayName: varchar("host_display_name", { length: 255 }).notNull(),
    startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
    stoppedAt: timestamp("stopped_at", { withTimezone: true }),
  },
  (t) => [
    index("idx_livestream_sessions_family_id_started_at").on(t.familyId, t.startedAt.desc()),
    index("idx_livestream_sessions_family_id").on(t.familyId),
  ]
);
