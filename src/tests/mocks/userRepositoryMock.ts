import mongoose from "npm:mongoose";
import bcrypt from "npm:bcrypt";
import type UserData from "../../types/UserData.ts";
import type UpdatePasswordData from "../../types/UpdatePasswordData.ts";
import type { UserPasswordData } from "../../types/UserPasswordData.ts";
import type { createUserService } from "../../services/userService.ts";

// Extrai o contrato exato esperado pelo createUserService
export type UserRepositoryContract = NonNullable<Parameters<typeof createUserService>[0]>;

export const userRepositoryMock: UserRepositoryContract = {
    findAll: async (_page?: number) => [
        {
            _id: new mongoose.Types.ObjectId("507f1f77bcf86cd799439011"),
            username: "Test User"
        },
        {
            _id: new mongoose.Types.ObjectId("507f1f77bcf86cd799439012"),
            username: "Outro Usuário"
        }
    ],

    getByEmail: async (_email: string) => null,

  
    create: async (data: UserData) => ({
        _id: new mongoose.Types.ObjectId("507f1f77bcf86cd799439011"),
        username: data.username,
        email: data.email
    }),
    removeById: async (_id: string) => ({
        acknowledged: true,
        deletedCount: 1
    }),

    getLastPasswordByIdAndEmail: async (_id: string, _email: string): Promise<UserPasswordData | null> => null,

    updatePassword: async (_data: UpdatePasswordData): Promise<boolean> => true
};

const validPasswordHash = await bcrypt.hash("SenhaAntiga123", 12);

export const passwordRepositoryMock: UserRepositoryContract = {
    ...userRepositoryMock,

    getLastPasswordByIdAndEmail: async (_id: string, _email: string): Promise<UserPasswordData> => ({
        _id: new mongoose.Types.ObjectId("507f1f77bcf86cd799439011"),
        username: "Test User",
        email: "test@example.com",
        password: validPasswordHash,
        createdAt: new Date(),
        updatedAt: new Date()
    })
};

