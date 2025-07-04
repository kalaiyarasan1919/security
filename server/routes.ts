import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import session from "express-session";
import { storage } from "./storage";
import { 
  insertTaskSchema, 
  updateTaskSchema,
  insertTaskShareSchema,
  insertTaskCommentSchema,
  taskFiltersSchema,
  type User 
} from "@shared/schema";
import { z } from "zod";

// Configure session store
const sessionConfig = {
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
};

// OAuth configuration
const googleConfig = {
  clientID: process.env.GOOGLE_CLIENT_ID || '',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  callbackURL: process.env.GOOGLE_CALLBACK_URL || '/auth/google/callback'
};

// WebSocket clients storage
const wsClients = new Map<string, WebSocket>();

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // Configure session middleware
  app.use(session(sessionConfig));
  app.use(passport.initialize());
  app.use(passport.session());

  // Passport serialization
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUserById(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });

  // Google OAuth strategy
  passport.use(new GoogleStrategy({
    clientID: googleConfig.clientID,
    clientSecret: googleConfig.clientSecret,
    callbackURL: googleConfig.callbackURL,
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user exists
      let user = await storage.getUserByProvider('google', profile.id);
      
      if (!user) {
        // Create new user
        const userData = {
          id: `google_${profile.id}`,
          email: profile.emails?.[0]?.value || '',
          firstName: profile.name?.givenName || '',
          lastName: profile.name?.familyName || '',
          profileImageUrl: profile.photos?.[0]?.value || '',
          provider: 'google',
          providerId: profile.id,
        };
        user = await storage.createUser(userData);
      }
      
      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  }));

  // Authentication middleware
  const requireAuth = (req: any, res: any, next: any) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: 'Authentication required' });
  };

  // WebSocket server for real-time updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  wss.on('connection', (ws, req) => {
    console.log('Client connected to WebSocket');
    
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        if (data.type === 'authenticate' && data.userId) {
          wsClients.set(data.userId, ws);
          ws.send(JSON.stringify({ type: 'authenticated', userId: data.userId }));
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });
    
    ws.on('close', () => {
      // Remove client from map
      for (const [userId, client] of wsClients.entries()) {
        if (client === ws) {
          wsClients.delete(userId);
          break;
        }
      }
      console.log('Client disconnected from WebSocket');
    });
  });

  // Broadcast function for real-time updates
  const broadcast = (userId: string, data: any) => {
    const client = wsClients.get(userId);
    if (client && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  };

  const broadcastToTaskUsers = async (taskId: number, data: any, excludeUserId?: string) => {
    try {
      const task = await storage.getTaskById(taskId, excludeUserId || '');
      if (task) {
        // Broadcast to owner
        if (task.ownerId !== excludeUserId) {
          broadcast(task.ownerId, data);
        }
        
        // Broadcast to shared users
        if (task.shares) {
          for (const share of task.shares) {
            if (share.sharedWithUserId !== excludeUserId) {
              broadcast(share.sharedWithUserId, data);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error broadcasting to task users:', error);
    }
  };

  // Authentication routes
  app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

  app.get('/auth/google/callback', 
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
      res.redirect('/');
    }
  );

  app.post('/auth/logout', (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: 'Logout failed' });
      }
      res.json({ message: 'Logged out successfully' });
    });
  });

  app.get('/auth/user', (req, res) => {
    if (req.isAuthenticated()) {
      res.json(req.user);
    } else {
      res.status(401).json({ message: 'Not authenticated' });
    }
  });

  // Dashboard stats endpoint
  app.get('/api/dashboard/stats', requireAuth, async (req, res) => {
    try {
      const user = req.user as User;
      const stats = await storage.getDashboardStats(user.id);
      res.json(stats);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      res.status(500).json({ message: 'Failed to fetch dashboard statistics' });
    }
  });

  // Task management endpoints
  app.get('/api/tasks', requireAuth, async (req, res) => {
    try {
      const user = req.user as User;
      const filters = taskFiltersSchema.parse({
        ...req.query,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
      });
      
      const result = await storage.getUserTasks(user.id, filters);
      res.json(result);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      res.status(500).json({ message: 'Failed to fetch tasks' });
    }
  });

  app.get('/api/tasks/:id', requireAuth, async (req, res) => {
    try {
      const user = req.user as User;
      const taskId = parseInt(req.params.id);
      const task = await storage.getTaskById(taskId, user.id);
      
      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }
      
      res.json(task);
    } catch (error) {
      console.error('Error fetching task:', error);
      res.status(500).json({ message: 'Failed to fetch task' });
    }
  });

  app.post('/api/tasks', requireAuth, async (req, res) => {
    try {
      const user = req.user as User;
      const validatedData = insertTaskSchema.parse({
        ...req.body,
        ownerId: user.id,
      });
      
      const task = await storage.createTask(validatedData);
      
      // Broadcast task creation to user's WebSocket
      broadcast(user.id, { 
        type: 'task_created', 
        data: { ...task, owner: user } 
      });
      
      res.status(201).json(task);
    } catch (error) {
      console.error('Error creating task:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid task data', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to create task' });
    }
  });

  app.put('/api/tasks/:id', requireAuth, async (req, res) => {
    try {
      const user = req.user as User;
      const taskId = parseInt(req.params.id);
      const validatedData = updateTaskSchema.parse(req.body);
      
      const task = await storage.updateTask(taskId, user.id, validatedData);
      
      if (!task) {
        return res.status(404).json({ message: 'Task not found or access denied' });
      }
      
      // Broadcast task update to all relevant users
      await broadcastToTaskUsers(taskId, { 
        type: 'task_updated', 
        data: task 
      }, user.id);
      
      res.json(task);
    } catch (error) {
      console.error('Error updating task:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid task data', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to update task' });
    }
  });

  app.delete('/api/tasks/:id', requireAuth, async (req, res) => {
    try {
      const user = req.user as User;
      const taskId = parseInt(req.params.id);
      
      // Get task details before deletion for broadcasting
      const task = await storage.getTaskById(taskId, user.id);
      
      const success = await storage.deleteTask(taskId, user.id);
      
      if (!success) {
        return res.status(404).json({ message: 'Task not found or access denied' });
      }
      
      // Broadcast task deletion to all relevant users
      if (task) {
        await broadcastToTaskUsers(taskId, { 
          type: 'task_deleted', 
          data: { id: taskId } 
        }, user.id);
      }
      
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting task:', error);
      res.status(500).json({ message: 'Failed to delete task' });
    }
  });

  // Task sharing endpoints
  app.post('/api/tasks/:id/share', requireAuth, async (req, res) => {
    try {
      const user = req.user as User;
      const taskId = parseInt(req.params.id);
      const { email, permission } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: 'Email is required' });
      }
      
      // Find user by email
      const targetUser = await storage.getUserByEmail(email);
      if (!targetUser) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      const shareData = {
        taskId,
        sharedWithUserId: targetUser.id,
        sharedByUserId: user.id,
        permission: permission || 'view',
      };
      
      const success = await storage.shareTask(shareData);
      
      if (!success) {
        return res.status(400).json({ message: 'Task already shared with this user or access denied' });
      }
      
      // Broadcast task share to the target user
      broadcast(targetUser.id, {
        type: 'task_shared',
        data: { taskId, sharedBy: user, permission }
      });
      
      res.status(201).json({ message: 'Task shared successfully' });
    } catch (error) {
      console.error('Error sharing task:', error);
      res.status(500).json({ message: 'Failed to share task' });
    }
  });

  app.delete('/api/tasks/:id/share/:userId', requireAuth, async (req, res) => {
    try {
      const user = req.user as User;
      const taskId = parseInt(req.params.id);
      const sharedWithUserId = req.params.userId;
      
      const success = await storage.unshareTask(taskId, sharedWithUserId, user.id);
      
      if (!success) {
        return res.status(404).json({ message: 'Share not found or access denied' });
      }
      
      // Broadcast unshare to the target user
      broadcast(sharedWithUserId, {
        type: 'task_unshared',
        data: { taskId }
      });
      
      res.status(204).send();
    } catch (error) {
      console.error('Error unsharing task:', error);
      res.status(500).json({ message: 'Failed to unshare task' });
    }
  });

  // Comments endpoints
  app.post('/api/tasks/:id/comments', requireAuth, async (req, res) => {
    try {
      const user = req.user as User;
      const taskId = parseInt(req.params.id);
      const validatedData = insertTaskCommentSchema.parse({
        ...req.body,
        taskId,
        userId: user.id,
      });
      
      const comment = await storage.addComment(validatedData);
      
      if (!comment) {
        return res.status(404).json({ message: 'Task not found or access denied' });
      }
      
      // Broadcast comment to all task users
      await broadcastToTaskUsers(taskId, {
        type: 'comment_added',
        data: { ...comment, user }
      }, user.id);
      
      res.status(201).json({ ...comment, user });
    } catch (error) {
      console.error('Error adding comment:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid comment data', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to add comment' });
    }
  });

  // User search endpoint for sharing
  app.get('/api/users/search', requireAuth, async (req, res) => {
    try {
      const { email } = req.query;
      
      if (!email || typeof email !== 'string') {
        return res.status(400).json({ message: 'Email query parameter is required' });
      }
      
      const user = await storage.getUserByEmail(email);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Return limited user info for privacy
      res.json({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImageUrl: user.profileImageUrl,
      });
    } catch (error) {
      console.error('Error searching users:', error);
      res.status(500).json({ message: 'Failed to search users' });
    }
  });

  // Recent activities endpoint
  app.get('/api/activities', requireAuth, async (req, res) => {
    try {
      const user = req.user as User;
      const limit = parseInt(req.query.limit as string) || 20;
      const activities = await storage.getRecentActivities(user.id, limit);
      res.json(activities);
    } catch (error) {
      console.error('Error fetching activities:', error);
      res.status(500).json({ message: 'Failed to fetch activities' });
    }
  });

  return httpServer;
}
