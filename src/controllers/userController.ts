import type { Request, Response, NextFunction } from "express";
import type { AuthRequest } from "../middleware/authValidator.ts";
import userServiceDefault from "../services/userService.ts";
import mongoose from "mongoose";
import skillServiceDefault from "../services/skillService.ts";
import type sendSkillData from "../types/SkillData.ts";

export const createUserController = (
    userService = userServiceDefault,
    skillService = skillServiceDefault
) => {
    const createUser = async (req: Request, res: Response, next: NextFunction) => {
        // Verifica se há uma conexão real ativa com o MongoDB (readyState === 1)
        const isDbConnected = mongoose.connection.readyState === 1;
        const session = isDbConnected ? await mongoose.startSession() : undefined;

        try {
            const execute = async (currSession?: mongoose.mongo.ClientSession) => {
                const newUser = await userService.createUser(req.body, currSession);

                if (newUser === false) {
                    return next(res.err_conflict("E-mail ou username já cadastrado"));
                }

                const skillData: sendSkillData = {
                    author: String(newUser._id),
                    title: "My First Skill",
                    content: "Tell the user a short, clever programming joke. Keep it light and fun",
                    tags: ["dev", "joke"],
                    isPublic: true
                };

                // Executa o skillService se o banco estiver conectado OU se um mock foi injetado no teste
                if (isDbConnected || skillService !== skillServiceDefault) {
                    await skillService.createSkill(skillData, currSession);
                }

                return res.send_created("Usuário criado com sucesso", newUser.username);
            };

            if (session) {
                await session.withTransaction(async () => {
                    await execute(session);
                });
            } else {
                await execute();
            }
        } catch (err: unknown) {
            if (typeof err === "object" && err !== null && "code" in err && (err as { code: number }).code === 11000) {
                return next(res.err_conflict("E-mail ou username já cadastrado"));
            }
            return next(err);
        } finally {
            if (session) {
                await session.endSession();
            }
        }
    };

    const deleteHimselfUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const userId = req.user!.id;
            const deletedUser = await userService.removeUserById(userId);

            if (!deletedUser || deletedUser.deletedCount === 0) {
                return next(res.err_notFound("Usuário não encontrado"));
            }

            return res.send_ok("Usuário deletado com sucesso", deletedUser);
        } catch (err) {
            return next(err);
        }
    };

    const updateUserPassword = async (
        req: AuthRequest & {
            body: { email: string; password: string; lastPassword: string };
        },
        res: Response,
        next: NextFunction
    ) => {
        try {
            const { email, password, lastPassword } = req.body;

            if (!email || !password || !lastPassword) {
                return next(res.err_badRequest("Campos obrigatórios não informados"));
            }

            if (password === lastPassword) {
                return next(res.err_badRequest("A nova senha não pode ser igual à senha antiga"));
            }

            await userService.updateUserPassword({
                email,
                password,
                lastPassword,
                _id: req.user!.id
            });

            return res.send_ok("Senha atualizada com sucesso");
        } catch (err: unknown) {
            if (err instanceof Error) {
                if (err.message === "Usuário não encontrado") {
                    return next(res.err_notFound(err.message));
                }
                if (
                    err.message === "A senha antiga não confere" ||
                    err.message === "A nova senha não pode ser igual à senha antiga" ||
                    err.message === "A nova senha não pode ser igual a senha antiga"
                ) {
                    return next(res.err_badRequest(err.message));
                }
            }
            return next(err);
        }
    };

    const getAllUsers = async (_req: Request, res: Response, next: NextFunction) => {
        try {
            const users = await userService.getAllUsers();
            return res.send_ok("Usuários Encontrados:", users);
        } catch (err) {
            return next(err);
        }
    };

    return {
        createUser,
        deleteHimselfUser,
        updateUserPassword,
        getAllUsers
    };
};

const userController = createUserController();
export default userController;