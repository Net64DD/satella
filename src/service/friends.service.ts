import { User } from '../model/user.model';
import { ErrorResponse, Responses } from '../types/errors';

enum FriendRequestStatus {
    SENDED = 'SENT',
    RECEIVED = 'RECEIVED',
    ACCEPTED = 'ACCEPTED',
};

type FriendEntry = {
    userId: string;
    username: string;
    alias: string;
    avatar: string;
    accentColor: number;
    favoriteGames: string[];
    status?: FriendRequestStatus;
};

export const searchFriends = async (userId: string, query: string): Promise<FriendEntry[]> => {
    const user = await User.findOne({ ulid: userId });

    if (!user) {
        throw new ErrorResponse(Responses.NOT_FOUND, 'User not found');
    }

    const regex = new RegExp(query, 'i');
    const users = await User.find({
        $or: [
            { username: regex },
            { alias: regex },
        ],
        ulid: { $ne: user.ulid },
    });

    const friendsList: FriendEntry[] = users.map(friend => ({
        userId: friend.ulid,
        username: friend.username,
        alias: friend.alias,
        avatar: friend.avatar,
        accentColor: friend.accentColor,
        favoriteGames: friend.favoriteGames || [],
        pending: user.friends.sended.includes(friend.ulid) || user.friends.received.includes(friend.ulid),
    }));

    return friendsList;
};

export const addFriend = async (userId: string, friendId: string): Promise<FriendEntry> => {
    const user = await User.findOne({ ulid: userId });

    if (!user) {
        throw new ErrorResponse(Responses.NOT_FOUND, 'User not found');
    }

    const friend = await User.findOne({ ulid: friendId });
    if (!friend) {
        throw new ErrorResponse(Responses.NOT_FOUND, 'Friend not found');
    }

    if (user.friends.list.includes(friendId)) {
        throw new ErrorResponse(Responses.DUPLICATED_ACCOUNT, 'Already friends with this user');
    }

    if (user.friends.received.includes(friendId)) {
        throw new ErrorResponse(Responses.WAITING_TO_ACCEPT, 'Friend request already received');
    }

    if (user.friends.sended.includes(friendId)) {
        throw new ErrorResponse(Responses.DUPLICATED_ACCOUNT, 'Friend request already sent');
    }

    if(user.friends.list.length >= 100) {
        throw new ErrorResponse(Responses.BAD_REQUEST, 'Friend list is full');
    }

    friend.friends.received.push(userId);
    await friend.save();

    user.friends.sended.push(friendId);
    await user.save();

    console.debug('Added new friend request:', { userId, friendId });

    return {
        userId: friend.ulid,
        username: friend.username,
        alias: friend.alias,
        avatar: friend.avatar,
        accentColor: friend.accentColor,
        favoriteGames: friend.favoriteGames || [],
        status: FriendRequestStatus.SENDED,
    };
};

export const modifyFriendRequest = async (userId: string, friendId: string, accept: boolean) => {
    const user = await User.findOne({ ulid: userId });

    if (!user) {
        throw new ErrorResponse(Responses.NOT_FOUND, 'User not found');
    }

    const friend = await User.findOne({ ulid: friendId });

    if (!friend) {
        throw new ErrorResponse(Responses.NOT_FOUND, 'Friend not found');
    }

    if(user.friends.received.includes(friendId)) {
        user.friends.received = user.friends.received.filter((id: string) => id !== friendId);
        friend.friends.sended = friend.friends.sended.filter((id: string) => id !== userId);

        if(accept) {
            user.friends.list.push(friendId);
            friend.friends.list.push(userId);
        }
        await user.save();
        await friend.save();
        return;
    }

    if (user.friends.sended.includes(friendId) && !accept) {
        user.friends.sended = user.friends.sended.filter((id: string) => id !== friendId);
        await user.save();
        return;
    }

    throw new ErrorResponse(Responses.NOT_FOUND, 'Friend request not found');
};

export const removeFriend = async (userId: string, friendId: string) => {
    const user = await User.findOne({ ulid: userId });
    
    if (!user) {
        throw new ErrorResponse(Responses.NOT_FOUND, 'User not found');
    }
    
    const friend = await User.findOne({ ulid: friendId });

    if (!friend) {
        throw new ErrorResponse(Responses.NOT_FOUND, 'Friend account not found');
    }
    
    if (!user.friends.list.includes(friendId)) {
        throw new ErrorResponse(Responses.NOT_FOUND, 'You are not friends with this user');
    }

    user.friends.list = user.friends.list.filter((id: string) => id !== friendId);
    friend.friends.list = friend.friends.list.filter((id: string) => id !== userId);

    await user.save();
    await friend.save();
};

export const getFriendsList = async (userId: string): Promise<FriendEntry[]> => {
    const user = await User.findOne({ ulid: userId });

    if (!user) {
        throw new ErrorResponse(Responses.NOT_FOUND, 'User not found');
    }

    const friendsList: FriendEntry[] = [];
    for (const friendId of [...user.friends.list, ...user.friends.received, ...user.friends.sended]) {
        const friend = await User.findOne({ ulid: friendId });
        if (friend) {
            friendsList.push({
                userId: friend.ulid,
                username: friend.username,
                alias: friend.alias,
                avatar: friend.avatar,
                accentColor: friend.accentColor,
                favoriteGames: friend.favoriteGames || [],
                status: user.friends.sended.includes(friendId) ? FriendRequestStatus.SENDED : 
                        user.friends.received.includes(friendId) ? FriendRequestStatus.RECEIVED : FriendRequestStatus.ACCEPTED,
            });
        }
    }

    return friendsList;
};