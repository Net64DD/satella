import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import {
  getAchievements,
  getUserAchievements,
} from "@rest-controller/achievements.controller";

const router = Router();

router.get("/:game", getAchievements);
router.get("/user/:game", authMiddleware, getUserAchievements);

export default router;
