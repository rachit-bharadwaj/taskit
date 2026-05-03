import { Request, Response } from "express";
import { eq, and } from "drizzle-orm";
import connectDB from "../database/connection";
import { tasks, projectMembers, users } from "../database/schema";

// Create a task
export const createTask = async (req: Request, res: Response) => {
  const { title, description, status, priority, dueDate, projectId, assigneeId } = req.body;
  const creatorId = (req as any).user.id;

  try {
    const db = await connectDB();

    // Verify user is a member of the project
    const member = await db
      .select()
      .from(projectMembers)
      .where(and(eq(projectMembers.projectId, projectId), eq(projectMembers.userId, creatorId)))
      .limit(1);

    if (member.length === 0) {
      return res.status(403).json({ error: "Only project members can create tasks" });
    }

    const result = await db.insert(tasks).values({
      title,
      description,
      status,
      priority,
      dueDate: dueDate ? new Date(dueDate) : null,
      projectId,
      assigneeId,
      creatorId,
    }).returning();

    return res.status(201).json({ task: result[0] });
  } catch (error) {
    console.error("Create Task Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Get tasks for a project
export const getProjectTasks = async (req: Request, res: Response) => {
  const { projectId } = req.params;
  const userId = (req as any).user.id;

  try {
    const db = await connectDB();

    // Verify user is member of the project
    const member = await db
      .select()
      .from(projectMembers)
      .where(and(eq(projectMembers.projectId, parseInt(projectId as string)), eq(projectMembers.userId, userId)))
      .limit(1);

    if (member.length === 0) {
      return res.status(403).json({ error: "Access denied" });
    }

    const projectTasks = await db
      .select({
        id: tasks.id,
        title: tasks.title,
        description: tasks.description,
        status: tasks.status,
        priority: tasks.priority,
        dueDate: tasks.dueDate,
        projectId: tasks.projectId,
        assigneeId: tasks.assigneeId,
        assigneeName: users.name,
      })
      .from(tasks)
      .leftJoin(users, eq(tasks.assigneeId, users.id))
      .where(eq(tasks.projectId, parseInt(projectId as string)));

    return res.status(200).json({ tasks: projectTasks });
  } catch (error) {
    console.error("Get Tasks Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Update task status or assignment
export const updateTask = async (req: Request, res: Response) => {
  const { taskId } = req.params;
  const { status, priority, assigneeId, title, description } = req.body;
  const userId = (req as any).user.id;

  try {
    const db = await connectDB();

    // Find task and verify membership
    const task = await db.select().from(tasks).where(eq(tasks.id, parseInt(taskId as string))).limit(1);
    if (task.length === 0) {
      return res.status(404).json({ error: "Task not found" });
    }

    const member = await db
      .select()
      .from(projectMembers)
      .where(and(eq(projectMembers.projectId, task[0].projectId), eq(projectMembers.userId, userId)))
      .limit(1);

    if (member.length === 0) {
      return res.status(403).json({ error: "Access denied" });
    }

    const result = await db
      .update(tasks)
      .set({
        status,
        priority,
        assigneeId,
        title,
        description,
        updatedAt: new Date(),
      })
      .where(eq(tasks.id, parseInt(taskId as string)))
      .returning();

    return res.status(200).json({ task: result[0] });
  } catch (error) {
    console.error("Update Task Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
