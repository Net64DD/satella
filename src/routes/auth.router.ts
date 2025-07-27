import { Router } from 'express';
import { createAuthLink, createUserSession, linkUserDevice } from '../controller/auth.controller';

const router = Router();

// Unprotected routes
router.get('/', createAuthLink);
router.post('/link', linkUserDevice);
router.get('/callback', createUserSession);

export default router;