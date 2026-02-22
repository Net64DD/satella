import { ErrorResponse, Responses } from "../types/errors";
import DiscordOAuthService from "./discord.oauth";
import { Ulid, Uuid4 } from "id128";

import { BanType, User, UserBan, UserSession } from "../model/user.model";

export type Session = {
  ulid: string;
  username: string;
  avatar: string;
  alias: string;
  accentColor: number;
  createdAt: Date;
};

export const createSessionAndUser = async (code: string) => {
  const token = await DiscordOAuthService.getAccessToken(code);
  if (!token || !token.access_token) {
    throw new ErrorResponse(
      Responses.INVALID_CREDENTIALS,
      "Invalid access token",
    );
  }

  console.debug("Received access token:", token);

  const oauth = await DiscordOAuthService.getUser(token);
  if (!oauth) {
    throw new ErrorResponse(Responses.NOT_FOUND, "User not found");
  }

  console.debug("Received OAuth user:", oauth);

  let user = await User.findOne({ "discord.id": oauth.id });
  if (!user) {
    user = new User({
      ulid: Ulid.generate().toRaw(),
      discord: {
        id: oauth.id,
        access_token: token.access_token,
        token_type: token.token_type,
        refresh_token: token.refresh_token,
      },
      username: oauth.username,
      alias: oauth.username,
      avatar: `https://cdn.discordapp.com/avatars/${oauth.id}/${oauth.avatar}.png`,
      accentColor: oauth.accent_color || 0,
    });
    await user.save();
  }
  console.debug("User found or created:", user);

  const ban = await UserBan.findOne({
    userId: user.ulid,
    expiresAt: { $gt: new Date() },
    type: BanType.Account
  });
  if (ban) {
    throw new ErrorResponse(
      Responses.FORBIDDEN,
      "User is banned with reason: " + ban.reason,
    );
  }

  const session = new UserSession({
    userId: user.ulid,
    token: Uuid4.generate().toCanonical(),
    refreshToken: Uuid4.generate().toCanonical(),
    deviceLinkCode: Array(6)
      .fill(0)
      .map(() => Math.floor(Math.random() * 10))
      .join(""),
    isLinked: false,
    lastUsed: new Date(),
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + token.expires_in * 1000),
  });

  await session.save();

  console.debug("Created user session:", session);

  return {
    linkCode: session.deviceLinkCode,
  };
};

export const linkUserSession = async (
  deviceLinkCode: string,
  deviceId: string,
) => {
  const session = await UserSession.findOne({
    deviceLinkCode,
    isLinked: false,
  });

  if (!session) {
    throw new ErrorResponse(
      Responses.NOT_FOUND,
      "Session not found or already linked",
    );
  }

  const user = await User.findOne({ ulid: session.userId });

  if (!user) {
    throw new ErrorResponse(Responses.NOT_FOUND, "User not found");
  }

  const ban = await UserBan.findOne({
    userId: user.ulid,
    expiresAt: { $gt: new Date() },
    type: BanType.Account
  });

  if (ban) {
    throw new ErrorResponse(
      Responses.FORBIDDEN,
      "User is banned with reason: " + ban.reason,
    );
  }

  session.deviceId = deviceId;
  session.isLinked = true;
  session.lastUsed = new Date();
  session.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  await session.save();
  console.debug("Linked user session:", session);

  return {
    token: session.token,
    refreshToken: session.refreshToken,
    expiresAt: session.expiresAt,
  };
};

export const getUserSession = async (
  token: string,
  refreshToken?: string,
): Promise<Session> => {
  const session = await UserSession.findOne({
    token,
    isLinked: true,
  });

  if (!session) {
    throw new ErrorResponse(
      Responses.UNAUTHORIZED,
      "Invalid session or not linked",
    );
  }

  if (session.expiresAt < new Date()) {
    if (!refreshToken || session.refreshToken !== refreshToken) {
      throw new ErrorResponse(Responses.TOKEN_EXPIRED, "Session token expired");
    }
    session.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  }

  session.lastUsed = new Date();
  await session.save();

  const user = await User.findOne({ ulid: session.userId });
  if (!user) {
    throw new ErrorResponse(Responses.NOT_FOUND, "User not found");
  }

  const ban = await UserBan.findOne({
    userId: user.ulid,
    expiresAt: { $gt: new Date() },
    type: BanType.Account
  });

  if (ban) {
    throw new ErrorResponse(
      Responses.FORBIDDEN,
      "User is banned with reason: " + ban.reason,
    );
  }

  console.debug("Retrieved user session:", session);

  return {
    ulid: user.ulid,
    username: user.username!,
    alias: user.alias!,
    avatar: user.avatar!,
    accentColor: user.accentColor!,
    createdAt: user.createdAt! || new Date(),
  };
};

export const deleteUserSession = async (token: string) => {
  const session = await UserSession.findOne({ token });

  if (!session) {
    throw new ErrorResponse(Responses.NOT_FOUND, "Session not found");
  }

  await session.deleteOne();
  console.debug("Deleted user session:", session);

  return {
    message: "User session deleted successfully",
  };
};
