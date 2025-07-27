import { Request, Response } from 'express';
import DiscordOAuthService from '../service/oauth';

import { createSessionAndUser, getUserSession, linkUserSession, Session } from '../service/auth.service';
import { ErrorResponse, Responses } from '../types/errors';

export const createAuthLink = (req: Request, res: Response) => {
    return res.redirect(DiscordOAuthService.getURL());
};

export const createUserSession = async (req: Request, res: Response) => {
    const code = req.query.code as string;
    if (!code) {
        return res.status(400).json({ error: 'Code is required' });
    }

    try {
        const session = await createSessionAndUser(code);
        if (!session) {
            return res.status(404).json({ error: 'User not found' });
        }

        return res.status(Responses.OK).json(session);
    } catch (error) {
        console.error('Error creating user session:', error);
        if (error instanceof ErrorResponse) {
            return res.status(error.status).json({ error: error.message });
        }
        return res.status(500).json({ error: 'Internal server error' });
    }
};

export const linkUserDevice = async (req: Request, res: Response) => {
    const { linkCode, deviceId } = req.body;
    if (!linkCode || !deviceId) {
        return res.status(400).json({ error: 'Device link code and device ID are required' });
    }

    try {
        const session = await linkUserSession(linkCode, deviceId);
        if (!session) {
            return res.status(404).json({ error: 'Session not found or already linked' });
        }

        return res.status(Responses.OK).json(session);
    } catch (error) {
        console.error('Error linking user session:', error);
        if (error instanceof ErrorResponse) {
            return res.status(error.status).json({ error: error.message });
        }
        return res.status(500).json({ error: 'Internal server error' });
    }
};

export const retrieveUserSession = async (req: Request, res: Response) => {
    try {
        const session = req.session;
        if (!session) {
            return res.status(Responses.UNAUTHORIZED).json({ error: 'Invalid session' });
        }

        return res.status(Responses.OK).json(session);
    } catch (error) {
        console.error('Error retrieving user session:', error);
        if (error instanceof ErrorResponse) {
            return res.status(error.status).json({ error: error.message });
        }
        return res.status(500).json({ error: 'Internal server error' });
    }
};