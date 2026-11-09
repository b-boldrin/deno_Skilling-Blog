import type { Types } from "npm:mongoose";

export default interface UserData {
    _id?: string | Types.ObjectId;
    username: string;
    email: string;
    password: string;
    lastPassword?: string;
}