import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { addNewFriend, getUserFriends, modifyUserRequest, removeUserFriend, searchFriendByQuery } from '../controller/friends.controller';

const router = Router();

router.get('/', authMiddleware, getUserFriends);
router.get('/search', authMiddleware, searchFriendByQuery);

router.post('/add', authMiddleware, addNewFriend);
router.post('/remove', authMiddleware, removeUserFriend);
router.post('/modify', authMiddleware, modifyUserRequest);

export default router;