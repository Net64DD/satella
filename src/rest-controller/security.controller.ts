import { retrievePublicKeys } from "@services/pub-keys.service";
import { ErrorResponse, Responses } from "../types/errors";
import type { Request, Response } from "express";

export const getPublicKeys = async (req: Request, res: Response) => {
  try {
    const keys = await retrievePublicKeys();
    return res.status(Responses.OK).json(keys);
  } catch (error) {
    console.error("Error retrieving public keys:", error);
    if (error instanceof ErrorResponse) {
      return res.status(error.status).json({ error: error.message });
    }
    return res.status(500).json({ error: "Internal server error" });
  }
};