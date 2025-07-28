import mongoose from "mongoose";

export interface ControllerPak {
    pakId: string;
    ownerId: string;
    name: string;
    icon: string;
    color: number;
    buffer: Buffer;
    access: string[];
    createdAt: Date;
    updatedAt: Date;
}

export const ControllerPakSchema = new mongoose.Schema<ControllerPak>({
    pakId: { type: String, required: true, unique: true },
    ownerId: { type: String, required: true },
    name: { type: String, required: true },
    icon: String,
    color: { type: Number, default: 0 },
    buffer: { type: Buffer, default: Buffer.alloc(0) },
    access: { type: [String], default: [] },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    }
});

export const ControllerPak = mongoose.model<ControllerPak>('Controller_Pak', ControllerPakSchema);