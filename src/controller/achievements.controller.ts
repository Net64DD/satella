import type { Request, Response } from "express";
import { ErrorResponse, Responses } from "../types/errors";
import {
  listAchievements,
  listUserAchievements,
} from "@services/achievements.service";

export const getAchievements = async (req: Request, res: Response) => {
  const game = req.params.game as string;
  if (!game) {
    return res.status(400).json({ error: "Game query parameter is required" });
  }

  try {
    const achievements = await listAchievements(game);
    for (const achievement of achievements) {
      achievement.icon = `${process.env.AWS_BUCKET_URL}/achievements/${achievement.gameId.toLowerCase()}/${achievement.icon}`;
    }
    return res.status(Responses.OK).json(achievements);
  } catch (error) {
    console.error("Error retrieving achievements:", error);
    if (error instanceof ErrorResponse) {
      return res.status(error.status).json({ error: error.message });
    }
    return res.status(Responses.INTERNAL_SERVER_ERROR).json({
      error: "Internal server error",
    });
  }
};

export const getUserAchievements = async (req: Request, res: Response) => {
  const session = req.session;
  if (!session) {
    return res
      .status(Responses.UNAUTHORIZED)
      .json({ error: "Invalid session" });
  }

  const game = req.query.game as string;
  if (!game) {
    return res.status(400).json({ error: "Game query parameter is required" });
  }

  try {
    return res
      .status(Responses.OK)
      .json(await listUserAchievements(session.ulid, game));
  } catch (error) {
    console.error("Error retrieving user achievements:", error);
    if (error instanceof ErrorResponse) {
      return res.status(error.status).json({ error: error.message });
    }
    return res.status(Responses.INTERNAL_SERVER_ERROR).json({
      error: "Internal server error",
    });
  }
};
