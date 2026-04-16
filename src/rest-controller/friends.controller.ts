import type { Request, Response } from "express";
import { ErrorResponse, Responses } from "../types/errors";
import {
  addFriend,
  getFriendsList,
  modifyFriendRequest,
  removeFriend,
  searchFriends,
} from "../service/friends.service";

export const searchFriendByQuery = async (req: Request, res: Response) => {
  const session = req.session;
  if (!session) {
    return res
      .status(Responses.UNAUTHORIZED)
      .json({ error: "Invalid session" });
  }

  const query = req.query.q as string;

  if (!query) {
    return res
      .status(400)
      .json({ error: "User ID and search query are required" });
  }

  try {
    const friends = await searchFriends(session.ulid, query);
    return res.status(Responses.OK).json(friends);
  } catch (error) {
    console.error("Error searching friends:", error);
    if (error instanceof ErrorResponse) {
      return res.status(error.status).json({ error: error.message });
    }
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getUserFriends = async (req: Request, res: Response) => {
  const session = req.session;
  if (!session) {
    return res
      .status(Responses.UNAUTHORIZED)
      .json({ error: "Invalid session" });
  }

  try {
    const friends = await getFriendsList(session.ulid);
    return res.status(Responses.OK).json(friends);
  } catch (error) {
    console.error("Error retrieving friends list:", error);
    if (error instanceof ErrorResponse) {
      return res.status(error.status).json({ error: error.message });
    }
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const addNewFriend = async (req: Request, res: Response) => {
  const session = req.session;
  if (!session) {
    return res
      .status(Responses.UNAUTHORIZED)
      .json({ error: "Invalid session" });
  }

  const { friendId } = req.body;

  if (!friendId) {
    return res.status(400).json({ error: "Friend ID is required" });
  }

  try {
    await addFriend(session.ulid, friendId);
    return res
      .status(Responses.OK)
      .json({ message: "Friend request sent successfully" });
  } catch (error) {
    console.error("Error adding friend:", error);
    if (error instanceof ErrorResponse) {
      return res.status(error.status).json({ error: error.message });
    }
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const modifyUserRequest = async (req: Request, res: Response) => {
  const session = req.session;
  if (!session) {
    return res
      .status(Responses.UNAUTHORIZED)
      .json({ error: "Invalid session" });
  }

  const { friendId, accept } = req.body;

  if (!friendId || typeof accept !== "boolean") {
    return res
      .status(400)
      .json({ error: "Friend ID and accept status are required" });
  }

  try {
    await modifyFriendRequest(session.ulid, friendId, accept);
    return res
      .status(Responses.OK)
      .json({ message: "Friend request modified successfully" });
  } catch (error) {
    console.error("Error modifying friend request:", error);
    if (error instanceof ErrorResponse) {
      return res.status(error.status).json({ error: error.message });
    }
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const removeUserFriend = async (req: Request, res: Response) => {
  const session = req.session;
  if (!session) {
    return res
      .status(Responses.UNAUTHORIZED)
      .json({ error: "Invalid session" });
  }

  const { friendId } = req.body;

  if (!friendId) {
    return res.status(400).json({ error: "Friend ID is required" });
  }

  try {
    await removeFriend(session.ulid, friendId);
    return res
      .status(Responses.OK)
      .json({ message: "Friend removed successfully" });
  } catch (error) {
    console.error("Error removing friend:", error);
    if (error instanceof ErrorResponse) {
      return res.status(error.status).json({ error: error.message });
    }
    return res.status(500).json({ error: "Internal server error" });
  }
};
