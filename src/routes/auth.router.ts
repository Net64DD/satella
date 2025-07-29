import { Router } from 'express';
import { createAuthLink, createUserSession, linkUserDevice, removeUserSession } from '../controller/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Unprotected routes
router.get('/', createAuthLink);
router.post('/link', linkUserDevice);
router.get('/callback', createUserSession);
router.post('/logout', authMiddleware, removeUserSession);

export default router;