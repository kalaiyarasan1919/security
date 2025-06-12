import { pgTable, text, varchar, serial, timestamp, jsonb, integer, boolean, real, index } from "drizzle-orm/pg-core";
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
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").default("user").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

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
export type UpsertUser = typeof users.$inferInsert;

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
