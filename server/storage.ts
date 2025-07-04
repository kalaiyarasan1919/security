import { db } from "./db";
import { 
  users, 
  tasks, 
  taskShares, 
  taskComments, 
  activityLog,
  type User,
  type InsertUser,
  type Task,
  type InsertTask,
  type UpdateTask,
  type TaskWithDetails,
  type InsertTaskShare,
  type InsertTaskComment,
  type InsertActivityLog,
  type DashboardStats,
  type TaskFilters
} from "@shared/schema";
import { eq, and, desc, asc, or, like, gte, lte, sql, count } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

// User operations
export async function getUserById(id: string): Promise<User | undefined> {
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result[0];
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result[0];
}

export async function getUserByProvider(provider: string, providerId: string): Promise<User | undefined> {
  const result = await db.select().from(users)
    .where(and(eq(users.provider, provider), eq(users.providerId, providerId)))
    .limit(1);
  return result[0];
}

export async function createUser(userData: InsertUser): Promise<User> {
  const result = await db.insert(users).values(userData).returning();
  return result[0];
}

export async function updateUser(id: string, userData: Partial<InsertUser>): Promise<User | undefined> {
  const result = await db.update(users)
    .set({ ...userData, updatedAt: new Date() })
    .where(eq(users.id, id))
    .returning();
  return result[0];
}

// Task operations
export async function createTask(taskData: InsertTask): Promise<Task> {
  const result = await db.insert(tasks).values(taskData).returning();
  await logActivity({
    taskId: result[0].id,
    userId: taskData.ownerId,
    action: 'created',
    details: { title: taskData.title }
  });
  return result[0];
}

export async function updateTask(id: number, ownerId: string, taskData: UpdateTask): Promise<Task | undefined> {
  // Check if user owns the task or has edit permission
  const canEdit = await canUserEditTask(id, ownerId);
  if (!canEdit) {
    return undefined;
  }

  const result = await db.update(tasks)
    .set({ ...taskData, updatedAt: new Date() })
    .where(eq(tasks.id, id))
    .returning();
  
  if (result[0]) {
    await logActivity({
      taskId: id,
      userId: ownerId,
      action: 'updated',
      details: taskData
    });
  }
  
  return result[0];
}

export async function deleteTask(id: number, ownerId: string): Promise<boolean> {
  // Only owner can delete tasks
  const task = await db.select().from(tasks)
    .where(and(eq(tasks.id, id), eq(tasks.ownerId, ownerId)))
    .limit(1);
  
  if (!task[0]) {
    return false;
  }

  await db.delete(tasks).where(eq(tasks.id, id));
  await logActivity({
    taskId: id,
    userId: ownerId,
    action: 'deleted',
    details: { title: task[0].title }
  });
  
  return true;
}

export async function getTaskById(id: number, userId: string): Promise<TaskWithDetails | undefined> {
  // Get task with owner info
  const ownerAlias = alias(users, 'owner');
  const sharedUserAlias = alias(users, 'sharedUser');
  const commentUserAlias = alias(users, 'commentUser');

  const result = await db.select({
    task: tasks,
    owner: ownerAlias,
  })
  .from(tasks)
  .leftJoin(ownerAlias, eq(tasks.ownerId, ownerAlias.id))
  .where(
    and(
      eq(tasks.id, id),
      or(
        eq(tasks.ownerId, userId),
        sql`EXISTS (SELECT 1 FROM ${taskShares} WHERE ${taskShares.taskId} = ${tasks.id} AND ${taskShares.sharedWithUserId} = ${userId})`
      )
    )
  )
  .limit(1);

  if (!result[0]) {
    return undefined;
  }

  // Get shares
  const shares = await db.select({
    taskShare: taskShares,
    sharedWithUser: sharedUserAlias,
  })
  .from(taskShares)
  .leftJoin(sharedUserAlias, eq(taskShares.sharedWithUserId, sharedUserAlias.id))
  .where(eq(taskShares.taskId, id));

  // Get comments
  const comments = await db.select({
    comment: taskComments,
    user: commentUserAlias,
  })
  .from(taskComments)
  .leftJoin(commentUserAlias, eq(taskComments.userId, commentUserAlias.id))
  .where(eq(taskComments.taskId, id))
  .orderBy(asc(taskComments.createdAt));

  return {
    ...result[0].task,
    owner: result[0].owner,
    shares: shares.map(s => ({ ...s.taskShare, sharedWithUser: s.sharedWithUser })),
    comments: comments.map(c => ({ ...c.comment, user: c.user })),
    commentCount: comments.length,
    isShared: shares.length > 0,
  };
}

export async function getUserTasks(userId: string, filters: TaskFilters): Promise<{ tasks: TaskWithDetails[], totalCount: number }> {
  const ownerAlias = alias(users, 'owner');
  let whereConditions = [];

  // Base condition: user owns task or task is shared with user
  whereConditions.push(
    or(
      eq(tasks.ownerId, userId),
      sql`EXISTS (SELECT 1 FROM ${taskShares} WHERE ${taskShares.taskId} = ${tasks.id} AND ${taskShares.sharedWithUserId} = ${userId})`
    )
  );

  // Apply filters
  if (filters.status) {
    whereConditions.push(eq(tasks.status, filters.status));
  }

  if (filters.priority) {
    whereConditions.push(eq(tasks.priority, filters.priority));
  }

  if (filters.search) {
    whereConditions.push(
      or(
        like(tasks.title, `%${filters.search}%`),
        like(tasks.description, `%${filters.search}%`)
      )
    );
  }

  if (filters.dueDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const weekFromNow = new Date(today);
    weekFromNow.setDate(weekFromNow.getDate() + 7);

    switch (filters.dueDate) {
      case 'today':
        whereConditions.push(
          and(
            gte(tasks.dueDate, today),
            lte(tasks.dueDate, tomorrow)
          )
        );
        break;
      case 'tomorrow':
        whereConditions.push(
          and(
            gte(tasks.dueDate, tomorrow),
            lte(tasks.dueDate, new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000))
          )
        );
        break;
      case 'week':
        whereConditions.push(
          and(
            gte(tasks.dueDate, today),
            lte(tasks.dueDate, weekFromNow)
          )
        );
        break;
      case 'overdue':
        whereConditions.push(
          and(
            lte(tasks.dueDate, today),
            eq(tasks.status, 'todo')
          )
        );
        break;
    }
  }

  if (filters.shared !== undefined) {
    if (filters.shared) {
      whereConditions.push(
        sql`EXISTS (SELECT 1 FROM ${taskShares} WHERE ${taskShares.taskId} = ${tasks.id})`
      );
    } else {
      whereConditions.push(eq(tasks.ownerId, userId));
    }
  }

  // Get total count
  const countResult = await db.select({ count: count() })
    .from(tasks)
    .where(and(...whereConditions));

  const totalCount = countResult[0].count;

  // Get tasks with pagination
  const offset = (filters.page - 1) * filters.limit;
  
  const result = await db.select({
    task: tasks,
    owner: ownerAlias,
  })
  .from(tasks)
  .leftJoin(ownerAlias, eq(tasks.ownerId, ownerAlias.id))
  .where(and(...whereConditions))
  .orderBy(desc(tasks.updatedAt))
  .limit(filters.limit)
  .offset(offset);

  // Get comment counts for each task
  const taskIds = result.map(r => r.task.id);
  const commentCounts = await db.select({
    taskId: taskComments.taskId,
    count: count(),
  })
  .from(taskComments)
  .where(sql`${taskComments.taskId} IN (${taskIds.join(',')})`)
  .groupBy(taskComments.taskId);

  const commentCountMap = commentCounts.reduce((acc, cc) => {
    acc[cc.taskId] = cc.count;
    return acc;
  }, {} as Record<number, number>);

  const tasksWithDetails: TaskWithDetails[] = result.map(r => ({
    ...r.task,
    owner: r.owner,
    commentCount: commentCountMap[r.task.id] || 0,
    isShared: r.task.ownerId !== userId,
  }));

  return { tasks: tasksWithDetails, totalCount };
}

export async function getDashboardStats(userId: string): Promise<DashboardStats> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const userTasksCondition = or(
    eq(tasks.ownerId, userId),
    sql`EXISTS (SELECT 1 FROM ${taskShares} WHERE ${taskShares.taskId} = ${tasks.id} AND ${taskShares.sharedWithUserId} = ${userId})`
  );

  const [
    totalTasks,
    completedTasks,
    pendingTasks,
    overdueTasks,
    todayTasks,
    sharedTasks,
  ] = await Promise.all([
    db.select({ count: count() }).from(tasks).where(userTasksCondition),
    db.select({ count: count() }).from(tasks).where(and(userTasksCondition, eq(tasks.status, 'completed'))),
    db.select({ count: count() }).from(tasks).where(and(userTasksCondition, or(eq(tasks.status, 'todo'), eq(tasks.status, 'in_progress')))),
    db.select({ count: count() }).from(tasks).where(and(userTasksCondition, lte(tasks.dueDate, today), eq(tasks.status, 'todo'))),
    db.select({ count: count() }).from(tasks).where(and(userTasksCondition, gte(tasks.dueDate, today), lte(tasks.dueDate, tomorrow))),
    db.select({ count: count() }).from(taskShares).where(eq(taskShares.sharedWithUserId, userId)),
  ]);

  return {
    totalTasks: totalTasks[0].count,
    completedTasks: completedTasks[0].count,
    pendingTasks: pendingTasks[0].count,
    overdueTasks: overdueTasks[0].count,
    todayTasks: todayTasks[0].count,
    sharedTasks: sharedTasks[0].count,
  };
}

// Task sharing operations
export async function shareTask(shareData: InsertTaskShare): Promise<boolean> {
  // Check if task exists and user owns it
  const task = await db.select().from(tasks)
    .where(and(eq(tasks.id, shareData.taskId), eq(tasks.ownerId, shareData.sharedByUserId)))
    .limit(1);
  
  if (!task[0]) {
    return false;
  }

  // Check if already shared with this user
  const existingShare = await db.select().from(taskShares)
    .where(and(eq(taskShares.taskId, shareData.taskId), eq(taskShares.sharedWithUserId, shareData.sharedWithUserId)))
    .limit(1);
  
  if (existingShare[0]) {
    return false;
  }

  await db.insert(taskShares).values(shareData);
  await logActivity({
    taskId: shareData.taskId,
    userId: shareData.sharedByUserId,
    action: 'shared',
    details: { sharedWithUserId: shareData.sharedWithUserId, permission: shareData.permission }
  });
  
  return true;
}

export async function unshareTask(taskId: number, sharedWithUserId: string, sharedByUserId: string): Promise<boolean> {
  const result = await db.delete(taskShares)
    .where(and(
      eq(taskShares.taskId, taskId),
      eq(taskShares.sharedWithUserId, sharedWithUserId),
      eq(taskShares.sharedByUserId, sharedByUserId)
    ));
  
  return result.rowCount > 0;
}

// Comments operations
export async function addComment(commentData: InsertTaskComment): Promise<TaskComment | undefined> {
  // Check if user has access to the task
  const hasAccess = await canUserViewTask(commentData.taskId, commentData.userId);
  if (!hasAccess) {
    return undefined;
  }

  const result = await db.insert(taskComments).values(commentData).returning();
  await logActivity({
    taskId: commentData.taskId,
    userId: commentData.userId,
    action: 'commented',
    details: { comment: commentData.comment }
  });
  
  return result[0];
}

// Helper functions
async function canUserViewTask(taskId: number, userId: string): Promise<boolean> {
  const result = await db.select({ id: tasks.id })
    .from(tasks)
    .where(
      and(
        eq(tasks.id, taskId),
        or(
          eq(tasks.ownerId, userId),
          sql`EXISTS (SELECT 1 FROM ${taskShares} WHERE ${taskShares.taskId} = ${taskId} AND ${taskShares.sharedWithUserId} = ${userId})`
        )
      )
    )
    .limit(1);
  
  return result.length > 0;
}

async function canUserEditTask(taskId: number, userId: string): Promise<boolean> {
  const result = await db.select({ id: tasks.id })
    .from(tasks)
    .where(
      and(
        eq(tasks.id, taskId),
        or(
          eq(tasks.ownerId, userId),
          sql`EXISTS (SELECT 1 FROM ${taskShares} WHERE ${taskShares.taskId} = ${taskId} AND ${taskShares.sharedWithUserId} = ${userId} AND ${taskShares.permission} = 'edit')`
        )
      )
    )
    .limit(1);
  
  return result.length > 0;
}

async function logActivity(activityData: InsertActivityLog): Promise<void> {
  await db.insert(activityLog).values(activityData);
}

// Get recent activities for real-time updates
export async function getRecentActivities(userId: string, limit: number = 20): Promise<ActivityLog[]> {
  const userTasksCondition = or(
    eq(tasks.ownerId, userId),
    sql`EXISTS (SELECT 1 FROM ${taskShares} WHERE ${taskShares.taskId} = ${tasks.id} AND ${taskShares.sharedWithUserId} = ${userId})`
  );

  const result = await db.select()
    .from(activityLog)
    .leftJoin(tasks, eq(activityLog.taskId, tasks.id))
    .where(userTasksCondition)
    .orderBy(desc(activityLog.createdAt))
    .limit(limit);

  return result.map(r => r.activity_log);
}

export const storage = {
  // User operations
  getUserById,
  getUserByEmail,
  getUserByProvider,
  createUser,
  updateUser,
  
  // Task operations
  createTask,
  updateTask,
  deleteTask,
  getTaskById,
  getUserTasks,
  getDashboardStats,
  
  // Sharing operations
  shareTask,
  unshareTask,
  
  // Comments
  addComment,
  
  // Activities
  getRecentActivities,
};