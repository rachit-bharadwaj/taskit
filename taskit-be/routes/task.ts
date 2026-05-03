import { Router } from "express";
import { createTask, getProjectTasks, updateTask } from "../controllers/task";
import { authenticate } from "../middleware/auth";

const router = Router();

router.use(authenticate);

router.post("/", createTask);
router.get("/project/:projectId", getProjectTasks);
router.put("/:taskId", updateTask);

export { router as taskRoutes };
