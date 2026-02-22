import mongoose from "mongoose";
import { Game } from "../types/games";
import DEFAULT_OPTIONS from "./util.model";

export interface Achievement {
  id: string;
  name: string;
  points: number;
  maxProgress: number;
  description: string;
  category: number;
  icon: string;
  gameId: Game;
  createdAt: Date;
  updatedAt: Date;
}

export const AchievementSchema = new mongoose.Schema<Achievement>(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    maxProgress: { type: Number, default: 1 },
    points: { type: Number, required: true },
    category: { type: Number, required: true },
    description: { type: String, required: true },
    icon: { type: String, required: true },
    gameId: { type: String, enum: Object.values(Game), required: true },
  },
  DEFAULT_OPTIONS,
);

export const Achievement = mongoose.model<Achievement>(
  "Achievement",
  AchievementSchema,
);

export interface AchievementRecord {
  userId: string;
  achievementId: string;
  achievedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export const AchievementRecordSchema = new mongoose.Schema<AchievementRecord>(
  {
    userId: { type: String, required: true },
    achievementId: { type: String, required: true },
    achievedAt: { type: Date, default: Date.now },
  },
  DEFAULT_OPTIONS,
);

export const AchievementRecord = mongoose.model<AchievementRecord>(
  "AchievementRecord",
  AchievementRecordSchema,
);
