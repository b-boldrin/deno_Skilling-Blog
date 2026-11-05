import type { Types } from "npm:mongoose";

export interface UserPasswordData {
    _id: Types.ObjectId;
    username: string;
    email: string;
    password: string;
    createdAt: Date;
    updatedAt: Date;
}