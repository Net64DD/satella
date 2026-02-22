import { Achievement, AchievementRecord } from "@models/achievements.model";
import { ErrorResponse, Responses } from "../types/errors";

export const listAchievements = async (gameId: string) => {
  try {
    const achievements = await Achievement.find({ gameId });
    return achievements;
  } catch (error) {
    console.error("Error listing achievements:", error);
    throw new ErrorResponse(
      Responses.INTERNAL_SERVER_ERROR,
      "Failed to retrieve achievements",
    );
  }
};

export const listUserAchievements = async (userId: string, gameId: string) => {
  try {
    return await AchievementRecord.find({ userId, gameId });
  } catch (error) {
    console.error("Error listing user achievements:", error);
    throw new ErrorResponse(
      Responses.INTERNAL_SERVER_ERROR,
      "Failed to retrieve user achievements",
    );
  }
};
