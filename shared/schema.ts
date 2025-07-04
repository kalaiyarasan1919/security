import { pgTable, text, varchar, serial, timestamp, jsonb, integer, boolean, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique().notNull(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  provider: varchar("provider").notNull(), // google, github, facebook
  providerId: varchar("provider_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tasks table
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  status: varchar("status").default("todo").notNull(), // todo, in_progress, completed
  priority: varchar("priority").default("medium").notNull(), // low, medium, high, urgent
  dueDate: timestamp("due_date"),
  ownerId: varchar("owner_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table: PgTableWithColumns<any>) => [
  index("idx_tasks_owner").on(table.ownerId),
  index("idx_tasks_status").on(table.status),
  index("idx_tasks_due_date").on(table.dueDate),
]);

// Task sharing table for collaboration
export const taskShares = pgTable("task_shares", {
  id: serial("id").primaryKey(),
  taskId: integer("task_id").references(() => tasks.id, { onDelete: 'cascade' }).notNull(),
  sharedWithUserId: varchar("shared_with_user_id").references(() => users.id).notNull(),
  sharedByUserId: varchar("shared_by_user_id").references(() => users.id).notNull(),
  permission: varchar("permission").default("view").notNull(), // view, edit
  createdAt: timestamp("created_at").defaultNow(),
}, (table: PgTableWithColumns<any>) => [
  index("idx_task_shares_task").on(table.taskId),
  index("idx_task_shares_user").on(table.sharedWithUserId),
]);

// Comments on tasks
export const taskComments = pgTable("task_comments", {
  id: serial("id").primaryKey(),
  taskId: integer("task_id").references(() => tasks.id, { onDelete: 'cascade' }).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  comment: text("comment").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table: PgTableWithColumns<any>) => [
  index("idx_task_comments_task").on(table.taskId),
]);

// Activity log for real-time updates
export const activityLog = pgTable("activity_log", {
  id: serial("id").primaryKey(),
  taskId: integer("task_id").references(() => tasks.id, { onDelete: 'cascade' }),
  userId: varchar("user_id").references(() => users.id).notNull(),
  action: varchar("action").notNull(), // created, updated, deleted, shared, commented
  details: jsonb("details"), // Additional details about the action
  createdAt: timestamp("created_at").defaultNow(),
}, (table: PgTableWithColumns<any>) => [
  index("idx_activity_log_task").on(table.taskId),
  index("idx_activity_log_user").on(table.userId),
  index("idx_activity_log_created").on(table.createdAt),
]);

// Security policies table
export const policies = pgTable("policies", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  type: varchar("type").notNull(), // access_control, threat_detection, identity, etc.
  status: varchar("status").default("draft").notNull(), // draft, active, inactive, under_review
  rules: jsonb("rules").notNull(), // Policy rules in JSON format
  priority: integer("priority").default(0),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Threat intelligence feeds
export const threatFeeds = pgTable("threat_feeds", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  severity: varchar("severity").notNull(), // low, medium, high, critical
  source: varchar("source").notNull(), // mitre, custom, external_feed
  threatType: varchar("threat_type").notNull(), // malware, apt, phishing, etc.
  indicators: jsonb("indicators"), // IOCs, TTPs, etc.
  affectedSystems: integer("affected_systems").default(0),
  status: varchar("status").default("active").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Policy decision logs
export const policyDecisions = pgTable("policy_decisions", {
  id: serial("id").primaryKey(),
  policyId: integer("policy_id").references(() => policies.id),
  userId: varchar("user_id"),
  userContext: jsonb("user_context"), // IP, location, device, etc.
  decision: varchar("decision").notNull(), // allow, deny, mfa_required
  riskScore: real("risk_score"),
  reason: text("reason"),
  responseTime: integer("response_time"), // in milliseconds
  createdAt: timestamp("created_at").defaultNow(),
});

// Risk assessments
export const riskAssessments = pgTable("risk_assessments", {
  id: serial("id").primaryKey(),
  entityId: varchar("entity_id").notNull(), // user, system, or resource ID
  entityType: varchar("entity_type").notNull(), // user, system, resource
  riskScore: real("risk_score").notNull(),
  riskFactors: jsonb("risk_factors"), // breakdown of risk components
  assessmentType: varchar("assessment_type").notNull(), // behavioral, contextual, threat_based
  createdAt: timestamp("created_at").defaultNow(),
});

// System events for monitoring
export const systemEvents = pgTable("system_events", {
  id: serial("id").primaryKey(),
  eventType: varchar("event_type").notNull(), // login, policy_violation, threat_detected, etc.
  severity: varchar("severity").notNull(),
  source: varchar("source").notNull(), // system component that generated event
  userId: varchar("user_id"),
  details: jsonb("details"),
  resolved: boolean("resolved").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// API integrations status
export const apiIntegrations = pgTable("api_integrations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  endpoint: text("endpoint").notNull(),
  type: varchar("type").notNull(), // siem, firewall, cloud_security, identity_provider
  status: varchar("status").notNull(), // online, offline, degraded
  lastCheck: timestamp("last_check"),
  responseTime: integer("response_time"), // in milliseconds
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }: { many: any }) => ({
  ownedTasks: many(tasks, { relationName: "owner" }),
  sharedTasks: many(taskShares, { relationName: "sharedWith" }),
  sharedByTasks: many(taskShares, { relationName: "sharedBy" }),
  comments: many(taskComments),
  activities: many(activityLog),
}));

export const tasksRelations = relations(tasks, ({ one, many }: { one: any; many: any }) => ({
  owner: one(users, {
    fields: [tasks.ownerId],
    references: [users.id],
    relationName: "owner",
  }),
  shares: many(taskShares),
  comments: many(taskComments),
  activities: many(activityLog),
}));

export const taskSharesRelations = relations(taskShares, ({ one }: { one: any }) => ({
  task: one(tasks, {
    fields: [taskShares.taskId],
    references: [tasks.id],
  }),
  sharedWithUser: one(users, {
    fields: [taskShares.sharedWithUserId],
    references: [users.id],
    relationName: "sharedWith",
  }),
  sharedByUser: one(users, {
    fields: [taskShares.sharedByUserId],
    references: [users.id],
    relationName: "sharedBy",
  }),
}));

export const taskCommentsRelations = relations(taskComments, ({ one }: { one: any }) => ({
  task: one(tasks, {
    fields: [taskComments.taskId],
    references: [tasks.id],
  }),
  user: one(users, {
    fields: [taskComments.userId],
    references: [users.id],
  }),
}));

export const activityLogRelations = relations(activityLog, ({ one }: { one: any }) => ({
  task: one(tasks, {
    fields: [activityLog.taskId],
    references: [tasks.id],
  }),
  user: one(users, {
    fields: [activityLog.userId],
    references: [users.id],
  }),
}));

export const policiesRelations = relations(policies, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [policies.createdBy],
    references: [users.id],
  }),
  decisions: many(policyDecisions),
}));

export const policyDecisionsRelations = relations(policyDecisions, ({ one }) => ({
  policy: one(policies, {
    fields: [policyDecisions.policyId],
    references: [policies.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  ownerId: true,
  createdAt: true,
  updatedAt: true,
}).partial();

export const insertTaskShareSchema = createInsertSchema(taskShares).omit({
  id: true,
  createdAt: true,
});

export const insertTaskCommentSchema = createInsertSchema(taskComments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertActivityLogSchema = createInsertSchema(activityLog).omit({
  id: true,
  createdAt: true,
});

export const insertPolicySchema = createInsertSchema(policies).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertThreatFeedSchema = createInsertSchema(threatFeeds).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPolicyDecisionSchema = createInsertSchema(policyDecisions).omit({
  id: true,
  createdAt: true,
});

export const insertRiskAssessmentSchema = createInsertSchema(riskAssessments).omit({
  id: true,
  createdAt: true,
});

export const insertSystemEventSchema = createInsertSchema(systemEvents).omit({
  id: true,
  createdAt: true,
});

export const insertApiIntegrationSchema = createInsertSchema(apiIntegrations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type UpdateTask = z.infer<typeof updateTaskSchema>;

export type TaskShare = typeof taskShares.$inferSelect;
export type InsertTaskShare = z.infer<typeof insertTaskShareSchema>;

export type TaskComment = typeof taskComments.$inferSelect;
export type InsertTaskComment = z.infer<typeof insertTaskCommentSchema>;

export type ActivityLog = typeof activityLog.$inferSelect;
export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;

export type Policy = typeof policies.$inferSelect;
export type InsertPolicy = z.infer<typeof insertPolicySchema>;

export type ThreatFeed = typeof threatFeeds.$inferSelect;
export type InsertThreatFeed = z.infer<typeof insertThreatFeedSchema>;

export type PolicyDecision = typeof policyDecisions.$inferSelect;
export type InsertPolicyDecision = z.infer<typeof insertPolicyDecisionSchema>;

export type RiskAssessment = typeof riskAssessments.$inferSelect;
export type InsertRiskAssessment = z.infer<typeof insertRiskAssessmentSchema>;

export type SystemEvent = typeof systemEvents.$inferSelect;
export type InsertSystemEvent = z.infer<typeof insertSystemEventSchema>;

export type ApiIntegration = typeof apiIntegrations.$inferSelect;
export type InsertApiIntegration = z.infer<typeof insertApiIntegrationSchema>;

// Extended types with relations
export type TaskWithDetails = Task & {
  owner: User;
  shares?: (TaskShare & { sharedWithUser: User })[];
  comments?: (TaskComment & { user: User })[];
  commentCount?: number;
  isShared?: boolean;
};

export type DashboardStats = {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  todayTasks: number;
  sharedTasks: number;
};

// Validation schemas for API requests
export const taskFiltersSchema = z.object({
  status: z.enum(["todo", "in_progress", "completed"]).optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
  dueDate: z.enum(["today", "tomorrow", "week", "overdue"]).optional(),
  shared: z.boolean().optional(),
  search: z.string().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
});

export type TaskFilters = z.infer<typeof taskFiltersSchema>;
