import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  real,
  timestamp,
  uniqueIndex,
  index,
  serial,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    username: varchar("username", { length: 20 }).unique().notNull(),
    displayName: varchar("display_name", { length: 100 }),
    avatarUrl: text("avatar_url"),
    bio: varchar("bio", { length: 280 }),
    githubUsername: varchar("github_username", { length: 39 }),
    projectsCount: integer("projects_count").default(0).notNull(),
    flowersReceived: integer("flowers_received").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [uniqueIndex("idx_users_username").on(table.username)]
);

export const usersRelations = relations(users, ({ many }) => ({
  projects: many(projects),
}));

export const projects = pgTable(
  "projects",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    slug: varchar("slug", { length: 100 }).notNull(),
    name: varchar("name", { length: 100 }).notNull(),
    startDate: varchar("start_date", { length: 7 }).notNull(),
    endDate: varchar("end_date", { length: 7 }).notNull(),
    status: varchar("status", { length: 20 }).default("dead").notNull(),
    causeOfDeath: varchar("cause_of_death", { length: 100 }).notNull(),
    epitaph: varchar("epitaph", { length: 140 }).notNull(),
    description: text("description"),
    lessonsLearned: text("lessons_learned"),
    websiteUrl: text("website_url"),
    repoUrl: text("repo_url"),
    techStack: text("tech_stack").array(),
    screenshots: text("screenshots").array(),
    flowersCount: integer("flowers_count").default(0).notNull(),
    positionX: real("position_x"),
    positionY: real("position_y"),
    ogImageUrl: text("og_image_url"),
    telegramPostedAt: timestamp("telegram_posted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("idx_projects_user_slug").on(table.userId, table.slug),
    index("idx_projects_user").on(table.userId),
    index("idx_projects_flowers").on(table.flowersCount),
    index("idx_projects_created").on(table.createdAt),
  ]
);

export const projectsRelations = relations(projects, ({ one, many }) => ({
  user: one(users, { fields: [projects.userId], references: [users.id] }),
  flowers: many(flowers),
  condolences: many(condolences),
}));

export const flowers = pgTable(
  "flowers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    visitorHash: varchar("visitor_hash", { length: 64 }).notNull(),
    flowerType: varchar("flower_type", { length: 20 })
      .default("flower")
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("idx_flowers_unique").on(table.projectId, table.visitorHash),
    index("idx_flowers_project").on(table.projectId),
  ]
);

export const flowersRelations = relations(flowers, ({ one }) => ({
  project: one(projects, {
    fields: [flowers.projectId],
    references: [projects.id],
  }),
}));

export const condolences = pgTable(
  "condolences",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    visitorHash: varchar("visitor_hash", { length: 64 }).notNull(),
    message: varchar("message", { length: 280 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("idx_condolences_project").on(table.projectId),
  ]
);

export const condolencesRelations = relations(condolences, ({ one }) => ({
  project: one(projects, {
    fields: [condolences.projectId],
    references: [projects.id],
  }),
}));

export const causesOfDeath = pgTable("causes_of_death", {
  id: serial("id").primaryKey(),
  label: varchar("label", { length: 100 }).notNull(),
  emoji: varchar("emoji", { length: 10 }),
  sortOrder: integer("sort_order").default(0).notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
export type Flower = typeof flowers.$inferSelect;
export type Condolence = typeof condolences.$inferSelect;
export type CauseOfDeath = typeof causesOfDeath.$inferSelect;
