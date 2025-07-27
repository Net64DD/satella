import { Request, Response } from 'express';

import { getUserSession } from '../service/auth.service';
import { ErrorResponse, Responses } from '../types/errors';

export const authMiddleware = async (req: Request, res: Response, next: Function) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(Responses.UNAUTHORIZED).json({ error: 'Authorization token is required' });
        }

        console.debug('Authenticating user session with token:', token);

        const refreshToken = req.headers['x-refresh-token'] as string;

        const session = await getUserSession(token, refreshToken);
        if (!session) {
            return res.status(Responses.UNAUTHORIZED).json({ error: 'Session not found' });
        }

        req.session = session;
        next();
    } catch (error) {
        console.error('Authentication middleware error:', error);

        if(error instanceof ErrorResponse) {
            return res.status(error.status).json({ error: error.message });
        }

        return res.status(500).json({ error: 'Internal server error' });
    }
};