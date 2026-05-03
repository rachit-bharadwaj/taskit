import { Router } from "express";
import { createProject, getProjects, addProjectMember, getProjectStats, getProjectMembers } from "../controllers/project";
import { authenticate } from "../middleware/auth";

const router = Router();

router.use(authenticate);

router.get("/stats", getProjectStats);
router.get("/:projectId/members", getProjectMembers);
router.post("/", createProject);
router.get("/", getProjects);
router.post("/members", addProjectMember);

export { router as projectRoutes };
