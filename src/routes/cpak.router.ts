import { Router } from 'express';
import { createPak, deletePak, downloadPak, listPaks, modifyPakAccess, uploadPak } from '../controller/cpak.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authMiddleware, listPaks);
router.post('/', authMiddleware, createPak);

router.put('/:pakId', authMiddleware, uploadPak);
router.get('/:pakId', authMiddleware, downloadPak);
router.delete('/:pakId', authMiddleware, deletePak);
router.post('/:pakId/access', authMiddleware, modifyPakAccess);

export default router;