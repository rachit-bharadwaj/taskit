import { Router } from "express";
import { googleLogin, githubLogin, getMe } from "../controllers/auth";

const router = Router();

router.post("/google", googleLogin);
router.post("/github", githubLogin);
router.get("/me", getMe);

export { router as authRoutes };
