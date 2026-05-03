import { Router } from "express";
import { createProject, getProjects, addProjectMember, getProjectStats } from "../controllers/project";
import { authenticate } from "../middleware/auth";

const router = Router();

router.use(authenticate);

router.get("/stats", getProjectStats);
router.post("/", createProject);
router.get("/", getProjects);
router.post("/members", addProjectMember);

export { router as projectRoutes };
