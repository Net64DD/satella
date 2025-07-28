import { Request, Response } from 'express';
import { ErrorResponse, Responses } from '../types/errors';
import { createControllerPak, deleteControllerPak, downloadControllerPak, getControllerPaks, modifyControllerPakAccess, uploadControllerPak } from '../service/cpak.service';

export const createPak = async (req: Request, res: Response) => {
    const session = req.session;
    if (!session) {
        return res.status(Responses.UNAUTHORIZED).json({ error: 'Invalid session' });
    }

    const pak = req.file;

    if (!pak || !pak.buffer) {
        return res.status(Responses.BAD_REQUEST).json({ error: 'Invalid Controller Pak ID or buffer data' });
    }

    console.debug('Creating Controller Pak for user:', session.ulid, req);

    try {
        return res.status(Responses.OK).json(
            await createControllerPak(session.ulid, pak.buffer)
        );
    } catch (error) {
        console.error('Error creating Controller Pak:', error);
        if (error instanceof ErrorResponse) {
            return res.status(error.status).json({ error: error.message });
        }
        return res.status(Responses.INTERNAL_SERVER_ERROR).json({ error: 'Internal server error' });
    }
};

export const deletePak = async (req: Request, res: Response) => {
    const session = req.session;
    if (!session) {
        return res.status(Responses.UNAUTHORIZED).json({ error: 'Invalid session' });
    }

    const { pakId } = req.params;
    if (!pakId) {
        return res.status(Responses.BAD_REQUEST).json({ error: 'Controller Pak ID is required' });
    }

    try {
        await deleteControllerPak(session.ulid, pakId);
        return res.status(Responses.OK).send();
    } catch (error) {
        console.error('Error deleting Controller Pak:', error);
        if (error instanceof ErrorResponse) {
            return res.status(error.status).json({ error: error.message });
        }
        return res.status(Responses.INTERNAL_SERVER_ERROR).json({ error: 'Internal server error' });
    }
};

export const uploadPak = async (req: Request, res: Response) => {
    const session = req.session;
    if (!session) {
        return res.status(Responses.UNAUTHORIZED).json({ error: 'Invalid session' });
    }

    const pak = req.file;

    if (!pak || !pak.buffer) {
        return res.status(Responses.BAD_REQUEST).json({ error: 'Invalid Controller Pak ID or buffer data' });
    }

    const { pakId } = req.params;

    if (!pakId) {
        return res.status(Responses.BAD_REQUEST).json({ error: 'Invalid Controller Pak ID or buffer data' });
    }

    try {
        return res.status(Responses.OK).json(
            await uploadControllerPak(session.ulid, pakId, pak.buffer)
        );
    } catch (error) {
        console.error('Error uploading Controller Pak:', error);
        if (error instanceof ErrorResponse) {
            return res.status(error.status).json({ error: error.message });
        }
        return res.status(Responses.INTERNAL_SERVER_ERROR).json({ error: 'Internal server error' });
    }
};

export const downloadPak = async (req: Request, res: Response) => {
    const { pakId } = req.params;
    if (!pakId) {
        return res.status(Responses.BAD_REQUEST).json({ error: 'Controller Pak ID is required' });
    }

    try {
        const buffer = await downloadControllerPak(pakId);
        res.setHeader('Content-Type', 'application/octet-stream');
        res.setHeader('Content-Disposition', `attachment; filename=${pakId}.pak`);
        return res.status(Responses.OK).send(buffer);
    } catch (error) {
        console.error('Error downloading Controller Pak:', error);
        if (error instanceof ErrorResponse) {
            return res.status(error.status).json({ error: error.message });
        }
        return res.status(Responses.INTERNAL_SERVER_ERROR).json({ error: 'Internal server error' });
    }
};

export const listPaks = async (req: Request, res: Response) => {
    const session = req.session;
    if (!session) {
        return res.status(Responses.UNAUTHORIZED).json({ error: 'Invalid session' });
    }

    try {
        const paks = await getControllerPaks(session.ulid);
        return res.status(Responses.OK).json(paks);
    } catch (error) {
        console.error('Error retrieving Controller Paks:', error);
        if (error instanceof ErrorResponse) {
            return res.status(error.status).json({ error: error.message });
        }
        return res.status(Responses.INTERNAL_SERVER_ERROR).json({ error: 'Internal server error' });
    }
};

export const modifyPakAccess = async (req: Request, res: Response) => {
    const session = req.session;
    if (!session) {
        return res.status(Responses.UNAUTHORIZED).json({ error: 'Invalid session' });
    }

    const { pakId } = req.params;
    if (!pakId) {
        return res.status(Responses.BAD_REQUEST).json({ error: 'Controller Pak ID is required' });
    }

    const { userId, allow } = req.body;
    if (!pakId || !userId) {
        return res.status(Responses.BAD_REQUEST).json({ error: 'Controller Pak ID and action are required' });
    }

    try {
        await modifyControllerPakAccess(session.ulid, pakId, userId, allow);
        return res.status(Responses.OK).json({ message: 'Controller Pak access modified successfully' });
    } catch (error) {
        console.error('Error modifying Controller Pak access:', error);
        if (error instanceof ErrorResponse) {
            return res.status(error.status).json({ error: error.message });
        }
        return res.status(Responses.INTERNAL_SERVER_ERROR).json({ error: 'Internal server error' });
    }
};