import { Request, Response } from "express";
import { eq, and, inArray } from "drizzle-orm";
import connectDB from "../database/connection";
import { projects, projectMembers, users, tasks } from "../database/schema";

// Create a new project
export const createProject = async (req: Request, res: Response) => {
  const { name, description } = req.body;
  const userId = (req as any).user.id;

  try {
    const db = await connectDB();
    const result = await db.insert(projects).values({
      name,
      description,
      ownerId: userId,
    }).returning();

    const project = result[0];

    // Automatically add the creator as an admin member
    await db.insert(projectMembers).values({
      projectId: project.id,
      userId,
      role: "admin",
    });

    return res.status(201).json({ project });
  } catch (error) {
    console.error("Create Project Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Get all projects for a user
export const getProjects = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;

  try {
    const db = await connectDB();
    const userProjects = await db
      .select({
        project: projects,
        role: projectMembers.role,
      })
      .from(projects)
      .innerJoin(projectMembers, eq(projects.id, projectMembers.projectId))
      .where(eq(projectMembers.userId, userId));

    return res.status(200).json({ projects: userProjects });
  } catch (error) {
    console.error("Get Projects Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Add member to project
export const addProjectMember = async (req: Request, res: Response) => {
  const { projectId, email, role } = req.body;
  const adminId = (req as any).user.id;

  try {
    const db = await connectDB();

    // Verify requester is admin of the project
    const adminMember = await db
      .select()
      .from(projectMembers)
      .where(and(eq(projectMembers.projectId, projectId), eq(projectMembers.userId, adminId), eq(projectMembers.role, "admin")))
      .limit(1);

    if (adminMember.length === 0) {
      return res.status(403).json({ error: "Only admins can add members" });
    }

    // Find user by email
    const userToAdd = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (userToAdd.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if already a member
    const existingMember = await db
      .select()
      .from(projectMembers)
      .where(and(eq(projectMembers.projectId, projectId), eq(projectMembers.userId, userToAdd[0].id)))
      .limit(1);

    if (existingMember.length > 0) {
      return res.status(400).json({ error: "User is already a member" });
    }

    await db.insert(projectMembers).values({
      projectId,
      userId: userToAdd[0].id,
      role: role || "member",
    });

    return res.status(200).json({ message: "Member added successfully" });
  } catch (error) {
    console.error("Add Member Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Get stats for dashboard
export const getProjectStats = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;

  try {
    const db = await connectDB();
    
    // Total Projects
    const userProjects = await db
      .select()
      .from(projectMembers)
      .where(eq(projectMembers.userId, userId));
    
    const projectIds = userProjects.map((p: any) => p.projectId);
    
    if (projectIds.length === 0) {
      return res.status(200).json({
        stats: { totalProjects: 0, inProgress: 0, completed: 0, overdue: 0 }
      });
    }

    // Tasks for these projects
    const allTasks = await db
      .select()
      .from(tasks)
      .where(inArray(tasks.projectId, projectIds));

    const now = new Date();
    const stats = {
      totalProjects: projectIds.length,
      inProgress: allTasks.filter((t: any) => t.status === "in_progress").length,
      completed: allTasks.filter((t: any) => t.status === "done").length,
      overdue: allTasks.filter((t: any) => t.status !== "done" && t.dueDate && new Date(t.dueDate) < now).length,
    };

    return res.status(200).json({ stats });
  } catch (error) {
    console.error("Get Stats Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Get members of a project
export const getProjectMembers = async (req: Request, res: Response) => {
  const { projectId } = req.params;
  const userId = (req as any).user.id;

  try {
    const db = await connectDB();

    // Verify user is member of the project
    const membership = await db
      .select()
      .from(projectMembers)
      .where(and(eq(projectMembers.projectId, parseInt(projectId as string)), eq(projectMembers.userId, userId)))
      .limit(1);

    if (membership.length === 0) {
      return res.status(403).json({ error: "Access denied" });
    }

    const members = await db
      .select({
        id: projectMembers.id,
        role: projectMembers.role,
        user: {
          id: users.id,
          name: users.name,
          email: users.email,
          avatarUrl: users.avatarUrl,
        },
      })
      .from(projectMembers)
      .innerJoin(users, eq(projectMembers.userId, users.id))
      .where(eq(projectMembers.projectId, parseInt(projectId as string)));

    return res.status(200).json({ members });
  } catch (error) {
    console.error("Get Members Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
