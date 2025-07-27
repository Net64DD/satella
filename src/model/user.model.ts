import mongoose from "mongoose";

export interface User {
    ulid: string;
    discord: {
        id: string;
        access_token: string;
        token_type: string;
        refresh_token: string;
    },
    username?: string;
    alias?: string;
    avatar?: string;
    accentColor?: string;
    favoriteGames?: string[];
}

const UserSchema = new mongoose.Schema<User>({
    ulid: String,
    discord: {
        id: { type: String, required: true, unique: true },
        access_token: String,
        token_type: String,
        refresh_token: String,
    },
    username: String,
    alias: String,
    avatar: String,
    accentColor: String,
    favoriteGames: {
        type: [String],
        default: [],
    },
});

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

const UserSessionSchema = new mongoose.Schema<UserSession>({
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
    createdAt: {
        type: Date,
        default: Date.now,
    },
    expiresAt: {
        type: Date,
        required: true,
    },
});

export const User = mongoose.model('User', UserSchema);
export const UserSession = mongoose.model('User_Session', UserSessionSchema);