import mongoose from "mongoose";
import DEFAULT_OPTIONS from "./util.model";

export interface UserFriends {
  list: string[];
  sended: string[];
  received: string[];
}

export interface User {
  ulid: string;
  discord: {
    id: string;
    access_token: string;
    token_type: string;
    refresh_token: string;
  };
  username: string;
  alias: string;
  avatar: string;
  accentColor: number;
  favoriteGames: string[];
  friends: UserFriends;
  createdAt: Date;
}

const UserSchema = new mongoose.Schema<User>(
  {
    ulid: String,
    discord: {
      id: { type: String, required: true, unique: true },
      access_token: String,
      token_type: String,
      refresh_token: String,
    },
    username: { type: String, required: true },
    alias: { type: String, required: true },
    avatar: { type: String, required: true },
    accentColor: { type: Number, required: true },
    favoriteGames: {
      type: [String],
      default: [],
    },
    friends: {
      list: { type: [String], default: [] },
      sended: { type: [String], default: [] },
      received: { type: [String], default: [] },
    },
  },
  DEFAULT_OPTIONS,
);

export interface UserSession {
  userId: string;
  token: string;
  refreshToken: string;
  deviceLinkCode: string;
  isLinked: boolean;
  lastUsed: Date;
  deviceId?: string;
  createdAt: Date;
  expiresAt: Date;
}

const UserSessionSchema = new mongoose.Schema<UserSession>(
  {
    userId: String,
    token: String,
    refreshToken: String,
    lastUsed: {
      type: Date,
      default: Date.now,
    },
    deviceId: String,
    deviceLinkCode: String,
    isLinked: {
      type: Boolean,
      default: false,
    },
  },
  DEFAULT_OPTIONS,
);

export interface UserBan {
  id: string;
  reason: string;
  expiresAt?: Date;
}

const UserBanSchema = new mongoose.Schema<UserBan>(
  {
    id: { type: String, required: true, unique: true },
    reason: String,
    expiresAt: Date,
  },
  DEFAULT_OPTIONS,
);

export const User = mongoose.model("User", UserSchema);
export const UserBan = mongoose.model("User_Ban", UserBanSchema);
export const UserSession = mongoose.model("User_Session", UserSessionSchema);
