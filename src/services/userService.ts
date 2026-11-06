import UserData from "../types/UserData.ts";
import bcrypt from "bcrypt";
import * as userRepository from "../repositories/userRepository.ts";
import mongoose from "mongoose"

type UserRepository = typeof userRepository;

export const createUserService = (
    repository: Pick<
        UserRepository,
        | "findAll"
        | "getByEmail"
        | "create"
        | "removeById"
        | "getLastPasswordByIdAndEmail"
        | "updatePassword"
    > = userRepository 
) => {

    const getAllUsers = async () => {
        return await repository.findAll();
    };

    const getUser = async (userData: UserData) => {
        const user = await repository.getByEmail(userData.email);

        if (!user) return false;

        return user;
    };

    const createUser = async (userData: UserData, session?: mongoose.mongo.ClientSession) => {
        
        const hashedPassword = await bcrypt.hash(userData.password, 12);

        userData.password = hashedPassword;

        return await repository.create(userData, session);
    };

    const removeUserById = async (id: string, session?: mongoose.mongo.ClientSession) => {
        return await repository.removeById(id, session);
    };

    const updateUserPassword = async (
        userData: {
            email: string;
            password: string;
            newPassword: string;
            _id: string;
        }
    ) => {

        const lastPassword = await repository.getLastPasswordByIdAndEmail(
            userData._id,
            userData.email
        );

        if (!lastPassword) {
            throw new Error("Usuário não encontrado");
        }

        const isSamePassword = await bcrypt.compare(
            userData.password,
            lastPassword.password
        );

        if (!isSamePassword) {
            throw new Error("A senha antiga não confere");
        }

        const isSameAsLastPassword = await bcrypt.compare(
            userData.newPassword,
            lastPassword.password
        );

        if (isSameAsLastPassword) {
            throw new Error("A nova senha não pode ser igual a senha antiga");
        }

        const hashedPassword = await bcrypt.hash(userData.newPassword, 12);

        return await repository.updatePassword({
            ...userData,
            password: hashedPassword
        });
    };

    return {
        getAllUsers,
        getUser,
        createUser,
        removeUserById,
        updateUserPassword
    };
};

const userService = createUserService();

export default userService;