import type UserData from "../types/UserData.ts";
import * as userRepository from "../repositories/userRepository.ts";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

type UserRepository = typeof userRepository;

export type CheckLoginResult =
    | { isPasswordValid: true; token: string }
    | { isPasswordValid: false; token?: undefined };

export const createAuthService = (
    repository:Partial<Pick<UserRepository, "getByEmail">> = userRepository
) => {
    const checkLogin = async (userData: UserData): Promise<CheckLoginResult> => {
        const user = await repository.getByEmail!(userData.email);

        if (!user) {
            return { isPasswordValid: false };
        }

        const isPasswordValid = await bcrypt.compare(userData.password, user.password);

        if (!isPasswordValid) {
            return { isPasswordValid: false };
        }

        const secret = Deno.env.get("JWT_SECRET") ?? "test_secret_fallback";
        const token = jwt.sign(
            { id: user._id.toString() },
            secret,
            { expiresIn: "15m" }
        );

        return { isPasswordValid: true, token };
    };

    return { checkLogin };
};

const authService = createAuthService();
export default authService;