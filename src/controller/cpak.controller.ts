import type { Request, Response } from "express";
import { ErrorResponse, Responses } from "../types/errors";
import {
  createControllerPak,
  deleteControllerPak,
  downloadControllerPak,
  getControllerPaks,
  updateControllerPak,
  uploadControllerPak,
} from "../service/cpak.service";
import { ControllerPak } from "../model/cpak.model";

export const createPak = async (req: Request, res: Response) => {
  const session = req.session;
  if (!session) {
    return res
      .status(Responses.UNAUTHORIZED)
      .json({ error: "Invalid session" });
  }

  console.debug("Creating Controller Pak for user:", session.ulid);

  try {
    return res
      .status(Responses.OK)
      .json(await createControllerPak(session.ulid));
  } catch (error) {
    console.error("Error creating Controller Pak:", error);
    if (error instanceof ErrorResponse) {
      return res.status(error.status).json({ error: error.message });
    }
    return res
      .status(Responses.INTERNAL_SERVER_ERROR)
      .json({ error: "Internal server error" });
  }
};

export const deletePak = async (req: Request, res: Response) => {
  const session = req.session;
  if (!session) {
    return res
      .status(Responses.UNAUTHORIZED)
      .json({ error: "Invalid session" });
  }

  const { pakId } = req.params;
  if (!pakId) {
    return res
      .status(Responses.BAD_REQUEST)
      .json({ error: "Controller Pak ID is required" });
  }

  try {
    await deleteControllerPak(session.ulid, pakId);
    return res.status(Responses.OK).send();
  } catch (error) {
    console.error("Error deleting Controller Pak:", error);
    if (error instanceof ErrorResponse) {
      return res.status(error.status).json({ error: error.message });
    }
    return res
      .status(Responses.INTERNAL_SERVER_ERROR)
      .json({ error: "Internal server error" });
  }
};

export const uploadPak = async (req: Request, res: Response) => {
  const session = req.session;
  if (!session) {
    return res
      .status(Responses.UNAUTHORIZED)
      .json({ error: "Invalid session" });
  }

  const { pakId } = req.params;

  if (!pakId) {
    return res
      .status(Responses.BAD_REQUEST)
      .json({ error: "Invalid Controller Pak ID" });
  }

  const pak = req.file;

  if (!pak || !pak.buffer) {
    return res
      .status(Responses.BAD_REQUEST)
      .json({ error: "Invalid Buffer data" });
  }

  try {
    await uploadControllerPak(session.ulid, pakId, pak.buffer);
    return res.status(Responses.OK).send();
  } catch (error) {
    console.error("Error uploading Controller Pak:", error);
    if (error instanceof ErrorResponse) {
      return res.status(error.status).json({ error: error.message });
    }
    return res
      .status(Responses.INTERNAL_SERVER_ERROR)
      .json({ error: "Internal server error" });
  }
};

export const updatePak = async (req: Request, res: Response) => {
  const session = req.session;
  if (!session) {
    return res
      .status(Responses.UNAUTHORIZED)
      .json({ error: "Invalid session" });
  }

  const { pakId } = req.params;
  if (!pakId) {
    return res
      .status(Responses.BAD_REQUEST)
      .json({ error: "Controller Pak ID is required" });
  }

  const data: Partial<ControllerPak> = req.body;
  if (!data.name && !data.access) {
    return res
      .status(Responses.BAD_REQUEST)
      .json({ error: "No data to update" });
  }
  try {
    await updateControllerPak(session.ulid, pakId, data);
    return res.status(Responses.OK).send();
  } catch (error) {
    console.error("Error updating Controller Pak:", error);
    if (error instanceof ErrorResponse) {
      return res.status(error.status).json({ error: error.message });
    }
    return res
      .status(Responses.INTERNAL_SERVER_ERROR)
      .json({ error: "Internal server error" });
  }
};

export const downloadPak = async (req: Request, res: Response) => {
  const { pakId } = req.params;
  if (!pakId) {
    return res
      .status(Responses.BAD_REQUEST)
      .json({ error: "Controller Pak ID is required" });
  }

  try {
    const buffer = await downloadControllerPak(pakId);
    res.setHeader("Content-Type", "application/octet-stream");
    res.setHeader("Content-Disposition", `attachment; filename=${pakId}.pak`);
    return res.status(Responses.OK).send(buffer);
  } catch (error) {
    console.error("Error downloading Controller Pak:", error);
    if (error instanceof ErrorResponse) {
      return res.status(error.status).json({ error: error.message });
    }
    return res
      .status(Responses.INTERNAL_SERVER_ERROR)
      .json({ error: "Internal server error" });
  }
};

export const listPaks = async (req: Request, res: Response) => {
  const session = req.session;
  if (!session) {
    return res
      .status(Responses.UNAUTHORIZED)
      .json({ error: "Invalid session" });
  }

  try {
    const paks = await getControllerPaks(session.ulid);
    return res.status(Responses.OK).json(paks);
  } catch (error) {
    console.error("Error retrieving Controller Paks:", error);
    if (error instanceof ErrorResponse) {
      return res.status(error.status).json({ error: error.message });
    }
    return res
      .status(Responses.INTERNAL_SERVER_ERROR)
      .json({ error: "Internal server error" });
  }
};
