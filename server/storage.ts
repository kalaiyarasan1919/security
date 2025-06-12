import { 
  users, 
  policies, 
  threatFeeds, 
  policyDecisions, 
  riskAssessments, 
  systemEvents, 
  apiIntegrations,
  type User, 
  type InsertUser,
  type Policy,
  type InsertPolicy,
  type ThreatFeed,
  type InsertThreatFeed,
  type PolicyDecision,
  type InsertPolicyDecision,
  type RiskAssessment,
  type InsertRiskAssessment,
  type SystemEvent,
  type InsertSystemEvent,
  type ApiIntegration,
  type InsertApiIntegration
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql, gte } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(insertUser: InsertUser): Promise<User>;
  
  // Policy operations
  getAllPolicies(): Promise<Policy[]>;
  createPolicy(insertPolicy: InsertPolicy): Promise<Policy>;
  updatePolicy(id: number, insertPolicy: InsertPolicy): Promise<Policy | undefined>;
  deletePolicy(id: number): Promise<boolean>;
  getActivePoliciesCount(): Promise<number>;
  getApplicablePolicies(resourceId: string): Promise<Policy[]>;
  
  // Threat operations
  getActiveThreatFeeds(): Promise<ThreatFeed[]>;
  createThreatFeed(insertThreat: InsertThreatFeed): Promise<ThreatFeed>;
  getThreatDetectionsCount(): Promise<number>;
  
  // Policy decision operations
  createPolicyDecision(insertDecision: InsertPolicyDecision): Promise<PolicyDecision>;
  getRecentPolicyDecisions(limit: number): Promise<PolicyDecision[]>;
  
  // Risk assessment operations
  createRiskAssessment(insertAssessment: InsertRiskAssessment): Promise<RiskAssessment>;
  getRiskTimeline(hours: number): Promise<Array<{ timestamp: string; riskScore: number }>>;
  getCurrentRiskScore(): Promise<number>;
  calculateRiskScore(userId: string, context: any): Promise<number>;
  
  // System operations
  createSystemEvent(insertEvent: InsertSystemEvent): Promise<SystemEvent>;
  getSystemEvents(limit: number): Promise<SystemEvent[]>;
  getSystemHealth(): Promise<number>;
  
  // API integration operations
  getAllApiIntegrations(): Promise<ApiIntegration[]>;
  createApiIntegration(insertIntegration: InsertApiIntegration): Promise<ApiIntegration>;
  updateApiIntegrationStatus(id: number, status: Partial<ApiIntegration>): Promise<ApiIntegration | undefined>;
  
  // Behavioral analytics
  getBehavioralAnalytics(userId?: string): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id.toString()));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Policy operations
  async getAllPolicies(): Promise<Policy[]> {
    return await db.select().from(policies).orderBy(desc(policies.createdAt));
  }

  async createPolicy(insertPolicy: InsertPolicy): Promise<Policy> {
    const [policy] = await db
      .insert(policies)
      .values(insertPolicy)
      .returning();
    return policy;
  }

  async updatePolicy(id: number, insertPolicy: InsertPolicy): Promise<Policy | undefined> {
    const [policy] = await db
      .update(policies)
      .set({ ...insertPolicy, updatedAt: new Date() })
      .where(eq(policies.id, id))
      .returning();
    return policy || undefined;
  }

  async deletePolicy(id: number): Promise<boolean> {
    const result = await db.delete(policies).where(eq(policies.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getActivePoliciesCount(): Promise<number> {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(policies)
      .where(eq(policies.status, 'active'));
    return result[0]?.count || 0;
  }

  async getApplicablePolicies(resourceId: string): Promise<Policy[]> {
    return await db
      .select()
      .from(policies)
      .where(eq(policies.status, 'active'))
      .orderBy(desc(policies.priority));
  }

  // Threat operations
  async getActiveThreatFeeds(): Promise<ThreatFeed[]> {
    return await db
      .select()
      .from(threatFeeds)
      .where(eq(threatFeeds.status, 'active'))
      .orderBy(desc(threatFeeds.createdAt));
  }

  async createThreatFeed(insertThreat: InsertThreatFeed): Promise<ThreatFeed> {
    const [threat] = await db
      .insert(threatFeeds)
      .values(insertThreat)
      .returning();
    return threat;
  }

  async getThreatDetectionsCount(): Promise<number> {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(threatFeeds)
      .where(eq(threatFeeds.status, 'active'));
    return result[0]?.count || 0;
  }

  // Policy decision operations
  async createPolicyDecision(insertDecision: InsertPolicyDecision): Promise<PolicyDecision> {
    const [decision] = await db
      .insert(policyDecisions)
      .values(insertDecision)
      .returning();
    return decision;
  }

  async getRecentPolicyDecisions(limit: number): Promise<PolicyDecision[]> {
    return await db
      .select()
      .from(policyDecisions)
      .orderBy(desc(policyDecisions.createdAt))
      .limit(limit);
  }

  // Risk assessment operations
  async createRiskAssessment(insertAssessment: InsertRiskAssessment): Promise<RiskAssessment> {
    const [assessment] = await db
      .insert(riskAssessments)
      .values(insertAssessment)
      .returning();
    return assessment;
  }

  async getRiskTimeline(hours: number): Promise<Array<{ timestamp: string; riskScore: number }>> {
    const hoursAgo = new Date(Date.now() - hours * 60 * 60 * 1000);
    const assessments = await db
      .select({
        timestamp: riskAssessments.createdAt,
        riskScore: riskAssessments.riskScore
      })
      .from(riskAssessments)
      .where(gte(riskAssessments.createdAt, hoursAgo))
      .orderBy(riskAssessments.createdAt);

    return assessments.map(a => ({
      timestamp: a.timestamp?.toISOString() || new Date().toISOString(),
      riskScore: a.riskScore
    }));
  }

  async getCurrentRiskScore(): Promise<number> {
    const [latest] = await db
      .select({ riskScore: riskAssessments.riskScore })
      .from(riskAssessments)
      .orderBy(desc(riskAssessments.createdAt))
      .limit(1);
    return latest?.riskScore || Math.floor(Math.random() * 100);
  }

  async calculateRiskScore(userId: string, context: any): Promise<number> {
    // Simple risk calculation based on context
    let baseScore = 30;
    
    if (context?.location && context.location !== 'office') {
      baseScore += 20;
    }
    
    if (context?.deviceTrust && context.deviceTrust < 0.8) {
      baseScore += 25;
    }
    
    if (context?.timeOfDay && (context.timeOfDay < 6 || context.timeOfDay > 22)) {
      baseScore += 15;
    }
    
    return Math.min(100, baseScore + Math.floor(Math.random() * 20));
  }

  // System operations
  async createSystemEvent(insertEvent: InsertSystemEvent): Promise<SystemEvent> {
    const [event] = await db
      .insert(systemEvents)
      .values(insertEvent)
      .returning();
    return event;
  }

  async getSystemEvents(limit: number): Promise<SystemEvent[]> {
    return await db
      .select()
      .from(systemEvents)
      .orderBy(desc(systemEvents.createdAt))
      .limit(limit);
  }

  async getSystemHealth(): Promise<number> {
    const criticalEvents = await db
      .select({ count: sql<number>`count(*)` })
      .from(systemEvents)
      .where(eq(systemEvents.severity, 'critical'));
    
    const criticalCount = criticalEvents[0]?.count || 0;
    return Math.max(60, 100 - (criticalCount * 10));
  }

  // API integration operations
  async getAllApiIntegrations(): Promise<ApiIntegration[]> {
    return await db.select().from(apiIntegrations).orderBy(apiIntegrations.name);
  }

  async createApiIntegration(insertIntegration: InsertApiIntegration): Promise<ApiIntegration> {
    const [integration] = await db
      .insert(apiIntegrations)
      .values(insertIntegration)
      .returning();
    return integration;
  }

  async updateApiIntegrationStatus(id: number, status: Partial<ApiIntegration>): Promise<ApiIntegration | undefined> {
    const [integration] = await db
      .update(apiIntegrations)
      .set({ ...status, updatedAt: new Date() })
      .where(eq(apiIntegrations.id, id))
      .returning();
    return integration || undefined;
  }

  // Behavioral analytics
  async getBehavioralAnalytics(userId?: string): Promise<any> {
    return {
      normalBehaviorPattern: Math.random() > 0.7,
      anomalyScore: Math.floor(Math.random() * 100),
      riskFactors: ['location_change', 'unusual_hours'],
      confidence: 0.85 + Math.random() * 0.15
    };
  }
}

export const storage = new DatabaseStorage();