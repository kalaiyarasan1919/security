import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { 
  insertPolicySchema, 
  insertThreatFeedSchema, 
  insertPolicyDecisionSchema,
  insertRiskAssessmentSchema,
  insertSystemEventSchema,
  insertApiIntegrationSchema 
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // WebSocket server for real-time updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  wss.on('connection', (ws) => {
    console.log('Client connected to WebSocket');
    
    // Send initial data
    ws.send(JSON.stringify({ type: 'connected', message: 'WebSocket connection established' }));
    
    ws.on('close', () => {
      console.log('Client disconnected from WebSocket');
    });
  });

  // Broadcast function for real-time updates
  const broadcast = (data: any) => {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    });
  };

  // Dashboard stats endpoint
  app.get('/api/dashboard/stats', async (req, res) => {
    try {
      const [
        activePolicies,
        threatDetections,
        systemHealth,
        recentDecisions
      ] = await Promise.all([
        storage.getActivePoliciesCount(),
        storage.getThreatDetectionsCount(),
        storage.getSystemHealth(),
        storage.getRecentPolicyDecisions(5)
      ]);

      const riskScore = await storage.getCurrentRiskScore();

      res.json({
        activePolicies,
        threatDetections,
        riskScore,
        systemHealth,
        recentDecisions
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      res.status(500).json({ message: 'Failed to fetch dashboard statistics' });
    }
  });

  // Policy management endpoints
  app.get('/api/policies', async (req, res) => {
    try {
      const policies = await storage.getAllPolicies();
      res.json(policies);
    } catch (error) {
      console.error('Error fetching policies:', error);
      res.status(500).json({ message: 'Failed to fetch policies' });
    }
  });

  app.post('/api/policies', async (req, res) => {
    try {
      const validatedData = insertPolicySchema.parse(req.body);
      const policy = await storage.createPolicy(validatedData);
      
      // Broadcast policy creation
      broadcast({ type: 'policy_created', data: policy });
      
      res.status(201).json(policy);
    } catch (error) {
      console.error('Error creating policy:', error);
      res.status(400).json({ message: 'Failed to create policy' });
    }
  });

  app.put('/api/policies/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertPolicySchema.parse(req.body);
      const policy = await storage.updatePolicy(id, validatedData);
      
      if (!policy) {
        return res.status(404).json({ message: 'Policy not found' });
      }
      
      broadcast({ type: 'policy_updated', data: policy });
      res.json(policy);
    } catch (error) {
      console.error('Error updating policy:', error);
      res.status(400).json({ message: 'Failed to update policy' });
    }
  });

  app.delete('/api/policies/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deletePolicy(id);
      
      if (!success) {
        return res.status(404).json({ message: 'Policy not found' });
      }
      
      broadcast({ type: 'policy_deleted', data: { id } });
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting policy:', error);
      res.status(500).json({ message: 'Failed to delete policy' });
    }
  });

  // Threat intelligence endpoints
  app.get('/api/threats', async (req, res) => {
    try {
      const threats = await storage.getActiveThreatFeeds();
      res.json(threats);
    } catch (error) {
      console.error('Error fetching threats:', error);
      res.status(500).json({ message: 'Failed to fetch threat intelligence' });
    }
  });

  app.post('/api/threats', async (req, res) => {
    try {
      const validatedData = insertThreatFeedSchema.parse(req.body);
      const threat = await storage.createThreatFeed(validatedData);
      
      broadcast({ type: 'threat_detected', data: threat });
      res.status(201).json(threat);
    } catch (error) {
      console.error('Error creating threat feed:', error);
      res.status(400).json({ message: 'Failed to create threat feed' });
    }
  });

  // Policy Decision Point endpoint
  app.post('/api/policy/evaluate', async (req, res) => {
    try {
      const { userId, resourceId, context } = req.body;
      
      if (!userId || !resourceId) {
        return res.status(400).json({ message: 'userId and resourceId are required' });
      }

      // Get applicable policies
      const policies = await storage.getApplicablePolicies(resourceId);
      
      // Calculate risk score
      const riskScore = await storage.calculateRiskScore(userId, context);
      
      // Make policy decision
      let decision = 'allow';
      let reason = 'Access granted based on policy evaluation';
      
      if (riskScore > 80) {
        decision = 'deny';
        reason = 'High risk score detected';
      } else if (riskScore > 60) {
        decision = 'mfa_required';
        reason = 'Medium risk - additional authentication required';
      }

      // Log the decision
      const policyDecision = await storage.createPolicyDecision({
        policyId: policies[0]?.id || null,
        userId,
        userContext: context,
        decision,
        riskScore,
        reason,
        responseTime: Math.floor(Math.random() * 50) + 10 // Simulate response time
      });

      broadcast({ type: 'policy_decision', data: policyDecision });
      
      res.json({
        decision,
        riskScore,
        reason,
        decisionId: policyDecision.id
      });
    } catch (error) {
      console.error('Error evaluating policy:', error);
      res.status(500).json({ message: 'Failed to evaluate policy' });
    }
  });

  // Risk assessment endpoints
  app.get('/api/risk/timeline', async (req, res) => {
    try {
      const hours = parseInt(req.query.hours as string) || 24;
      const timeline = await storage.getRiskTimeline(hours);
      res.json(timeline);
    } catch (error) {
      console.error('Error fetching risk timeline:', error);
      res.status(500).json({ message: 'Failed to fetch risk timeline' });
    }
  });

  app.post('/api/risk/assess', async (req, res) => {
    try {
      const validatedData = insertRiskAssessmentSchema.parse(req.body);
      const assessment = await storage.createRiskAssessment(validatedData);
      
      broadcast({ type: 'risk_assessment', data: assessment });
      res.status(201).json(assessment);
    } catch (error) {
      console.error('Error creating risk assessment:', error);
      res.status(400).json({ message: 'Failed to create risk assessment' });
    }
  });

  // System events endpoints
  app.get('/api/events', async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const events = await storage.getSystemEvents(limit);
      res.json(events);
    } catch (error) {
      console.error('Error fetching system events:', error);
      res.status(500).json({ message: 'Failed to fetch system events' });
    }
  });

  app.post('/api/events', async (req, res) => {
    try {
      const validatedData = insertSystemEventSchema.parse(req.body);
      const event = await storage.createSystemEvent(validatedData);
      
      broadcast({ type: 'system_event', data: event });
      res.status(201).json(event);
    } catch (error) {
      console.error('Error creating system event:', error);
      res.status(400).json({ message: 'Failed to create system event' });
    }
  });

  // API integrations endpoints
  app.get('/api/integrations', async (req, res) => {
    try {
      const integrations = await storage.getAllApiIntegrations();
      res.json(integrations);
    } catch (error) {
      console.error('Error fetching API integrations:', error);
      res.status(500).json({ message: 'Failed to fetch API integrations' });
    }
  });

  app.post('/api/integrations', async (req, res) => {
    try {
      const validatedData = insertApiIntegrationSchema.parse(req.body);
      const integration = await storage.createApiIntegration(validatedData);
      res.status(201).json(integration);
    } catch (error) {
      console.error('Error creating API integration:', error);
      res.status(400).json({ message: 'Failed to create API integration' });
    }
  });

  app.put('/api/integrations/:id/status', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status, responseTime, errorMessage } = req.body;
      
      const integration = await storage.updateApiIntegrationStatus(id, {
        status,
        responseTime,
        errorMessage,
        lastCheck: new Date()
      });
      
      if (!integration) {
        return res.status(404).json({ message: 'API integration not found' });
      }
      
      broadcast({ type: 'integration_status_updated', data: integration });
      res.json(integration);
    } catch (error) {
      console.error('Error updating integration status:', error);
      res.status(500).json({ message: 'Failed to update integration status' });
    }
  });

  // Behavioral analytics endpoint
  app.get('/api/analytics/behavioral', async (req, res) => {
    try {
      const userId = req.query.userId as string;
      const analytics = await storage.getBehavioralAnalytics(userId);
      res.json(analytics);
    } catch (error) {
      console.error('Error fetching behavioral analytics:', error);
      res.status(500).json({ message: 'Failed to fetch behavioral analytics' });
    }
  });

  return httpServer;
}
