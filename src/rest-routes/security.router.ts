import { getPublicKeys } from '@rest-controller/security.controller';
import { Router } from 'express';

const router = Router();

router.get('/keys', getPublicKeys);

export default router;