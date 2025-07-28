import { User } from '../model/user.model';
import { ControllerPak } from '../model/cpak.model';
import { ErrorResponse, Responses } from '../types/errors';

import { Ulid } from 'id128';

export const randomHexColor = (): number => {
    return Math.floor(Math.random() * 0xFFFFFF);
};

export const createControllerPak = async (userId: string, pakData: Buffer): Promise<ControllerPak> => {
    const user = await User.findOne({ ulid: userId });
    if (!user) {
        throw new ErrorResponse(Responses.NOT_FOUND, 'User not found');
    }

    const maxSize  = +process.env.CONTROLLER_PAK_MAX_SIZE! * 1024;
    const maxSlots = +process.env.CONTROLLER_PAK_MAX_SLOTS!;

    if (pakData.length > maxSize) {
        throw new ErrorResponse(Responses.BAD_REQUEST, 'Controller Pak data exceeds maximum size');
    }

    const existing = await ControllerPak.find({ ownerId: user.ulid });
    if (existing.length >= maxSlots) {
        throw new ErrorResponse(Responses.BAD_REQUEST, 'Maximum number of Controller Paks reached');
    }

    const pak = new ControllerPak({
        pakId: Ulid.generate().toRaw(),
        ownerId: user.ulid,
        name: `#${existing.length + 1}`,
        icon: '',
        color: randomHexColor(),
        buffer: pakData,
        access: [],
    });

    await pak.save();
    
    const out: any = pak.toObject();
    delete out.buffer;
    delete out._id;
    delete out.__v;
    return out;
};

export const deleteControllerPak = async (userId: string, pakId: string): Promise<void> => {
    const user = await User.findOne({ ulid: userId });
    if (!user) {
        throw new ErrorResponse(Responses.NOT_FOUND, 'User not found');
    }

    const pak = await ControllerPak.findOne({ pakId, ownerId: user.ulid });
    if (!pak) {
        throw new ErrorResponse(Responses.NOT_FOUND, 'Controller Pak not found');
    }

    await pak.deleteOne();
};

export const uploadControllerPak = async (userId: string, pakId: string, buffer: Buffer) => {
    const user = await User.findOne({ ulid: userId });
    if (!user) {
        throw new ErrorResponse(Responses.NOT_FOUND, 'User not found');
    }

    const pak = await ControllerPak.findOne({ pakId, ownerId: user.ulid });
    if (!pak) {
        throw new ErrorResponse(Responses.NOT_FOUND, 'Controller Pak not found');
    }

    const maxSize  = +process.env.CONTROLLER_PAK_MAX_SIZE! * 1024;

    if (buffer.length > maxSize) {
        throw new ErrorResponse(Responses.BAD_REQUEST, 'Controller Pak data exceeds maximum size');
    }

    pak.buffer = buffer;
    pak.updatedAt = new Date();
    await pak.save();
};

export const downloadControllerPak = async (pakId: string): Promise<Buffer> => {
    const pak = await ControllerPak.findOne({ pakId });
    if (!pak) {
        throw new ErrorResponse(Responses.NOT_FOUND, 'Controller Pak not found');
    }

    return pak.buffer;
};

export const getControllerPaks = async (userId: string): Promise<ControllerPak[]> => {
    const user = await User.findOne({ ulid: userId });
    if (!user) {
        throw new ErrorResponse(Responses.NOT_FOUND, 'User not found');
    }

    const list = await ControllerPak.find({
        $or: [
            { ownerId: user.ulid },
            { access: { $in: [user.ulid] } }
        ]
    });

    return list.map(raw => {
        const pak: any = raw.toObject();
        delete pak.buffer;
        delete pak._id;
        delete pak.__v;
        return pak;
    });
};

export const modifyControllerPakAccess = async (userId: string, pakId: string, access: string, add: boolean) => {
    const user = await User.findOne({ ulid: userId });
    if (!user) {
        throw new ErrorResponse(Responses.NOT_FOUND, 'User not found');
    }

    const pak = await ControllerPak.findOne({ pakId, ownerId: user.ulid });
    if (!pak) {
        throw new ErrorResponse(Responses.NOT_FOUND, 'Controller Pak not found');
    }

    if (add) {
        if (!pak.access.includes(access)) {
            pak.access.push(access);
        }
    } else {
        pak.access = pak.access.filter((id: string) => id !== access);
    }
    pak.updatedAt = new Date();
    await pak.save();
};