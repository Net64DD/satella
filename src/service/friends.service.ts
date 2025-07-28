import { User } from '../model/user.model';
import { ErrorResponse, Responses } from '../types/errors';

type FriendEntry = {
    userId: string;
    alias: string;
    avatar: string;
    accentColor: string;
    favoriteGames: string[];
    pending: boolean;
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
        alias: friend.alias,
        avatar: friend.avatar,
        accentColor: friend.accentColor,
        favoriteGames: friend.favoriteGames || [],
        pending: user.friends.pending.includes(friend.ulid),
    }));

    return friendsList;
};

export const addFriend = async (userId: string, friendId: string) => {
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

    if (user.friends.pending.includes(friendId)) {
        throw new ErrorResponse(Responses.DUPLICATED_ACCOUNT, 'Friend request already sent');
    }

    if(user.friends.list.length >= 100) {
        throw new ErrorResponse(Responses.BAD_REQUEST, 'Friend list is full');
    }

    user.friends.pending.push(friendId);
    await user.save();
};

export const modifyFriendRequest = async (userId: string, friendId: string, accept: boolean) => {
    const user = await User.findOne({ ulid: userId });

    if (!user) {
        throw new ErrorResponse(Responses.NOT_FOUND, 'User not found');
    }

    if (!user.friends.pending.includes(friendId)) {
        throw new ErrorResponse(Responses.NOT_FOUND, 'Friend request not found');
    }

    user.friends.pending = user.friends.pending.filter((id: string) => id !== friendId);
    if (accept) {
        user.friends.list.push(friendId);
    }
    await user.save();
};

export const removeFriend = async (userId: string, friendId: string) => {
    const user = await User.findOne({ ulid: userId });

    if (!user) {
        throw new ErrorResponse(Responses.NOT_FOUND, 'User not found');
    }

    if (!user.friends.list.includes(friendId)) {
        throw new ErrorResponse(Responses.NOT_FOUND, 'Friend not found');
    }

    user.friends.list = user.friends.list.filter((id: string) => id !== friendId);
    await user.save();
};

export const getFriendsList = async (userId: string): Promise<FriendEntry[]> => {
    const user = await User.findOne({ ulid: userId });

    if (!user) {
        throw new ErrorResponse(Responses.NOT_FOUND, 'User not found');
    }

    const friendsList: FriendEntry[] = [];
    for (const friendId of [...user.friends.list, ...user.friends.pending]) {
        const friend = await User.findOne({ ulid: friendId });
        if (friend) {
            friendsList.push({
                userId: friend.ulid,
                alias: friend.alias,
                avatar: friend.avatar,
                accentColor: friend.accentColor,
                favoriteGames: friend.favoriteGames || [],
                pending: user.friends.pending.includes(friendId),
            });
        }
    }

    return friendsList;
};