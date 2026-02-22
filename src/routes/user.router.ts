import { Router } from "express";
import { retrieveUserSession } from "../controller/auth.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.get("/", authMiddleware, retrieveUserSession);

export default router;
