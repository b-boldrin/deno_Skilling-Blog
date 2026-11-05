// src/types/UserData.ts
import type { Types } from "npm:mongoose";

export default interface UserData {
    _id?: string | Types.ObjectId;
    username: string; // <- Verifique se estava como 'name' e ajuste para 'username'
    email: string;
    password: string;
    lastPassword?: string;
}