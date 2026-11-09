import type { Request, Response, NextFunction } from "express";
import type { AuthRequest } from "../middleware/authValidator.ts";
import userServiceDefault from "../services/userService.ts";
import mongoose from "mongoose";
import skillServiceDefault from "../services/skillService.ts";
import type SkillData from "../types/SkillData.ts";

export const createUserController = (
    userService = userServiceDefault,
    skillService = skillServiceDefault
) => {
    const createUser = async (req: Request, res: Response, next: NextFunction) => {
        
        const isDbConnected = mongoose.connection.readyState === 1;
        const session = isDbConnected ? await mongoose.startSession() : undefined;
        
        try {



            const execute = async (currSession?: mongoose.mongo.ClientSession) => {
                const newUser = await userService.createUser(req.body, currSession);

                if (newUser === false) {
                    return next(res.err_conflict("E-mail ou username já cadastrado", {received: {username: req.body.username, email: req.body.email}}));
                }

                const skillData: SkillData = {
                    author: String(newUser._id),
                    title: "My First Skill",
                    content: "Tell the user a short, clever programming joke. Keep it light and fun",
                    tags: ["dev", "joke"],
                    isPublic: true
                };

                
                if (isDbConnected || skillService !== skillServiceDefault) {
                    await skillService.createSkill(skillData, currSession);
                }

                return res.send_created("Usuário criado com sucesso", newUser);
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
                return next(res.err_conflict("E-mail ou username já cadastrado", {received: {username: req.body.username, email: req.body.email}}));
            }
            return next(err);
        } finally {
            if (session) {
                await session.endSession();
            }
        }
    };

    const deleteHimselfUser = async (req: AuthRequest, res: Response, next: NextFunction) => {


        const isDbConnected = mongoose.connection.readyState === 1;
        const session = isDbConnected ? await mongoose.startSession() : undefined;

        try {
           const userId = req.user!.id;
            

           const execute = async (currSession?: mongoose.mongo.ClientSession) => {
                const deletedUser = await userService.removeUserById(userId, currSession);

                if (!deletedUser || deletedUser.deletedCount === 0) {
                    return next(res.err_notFound("Usuário não encontrado", {received: {_id: userId } , possible_resolution: "Troque o token de acesso"}));
                }
                
                
                if (isDbConnected || skillService !== skillServiceDefault) {
                    await skillService.deleteAllSkillsForAuthorId(userId, currSession);
                }

                return res.send_ok("Usuário deletado com sucesso", deletedUser)
            }

            if (session) {
                await session.withTransaction(async () => {
                    await execute(session);
                });
            } else {
                await execute();
            }

            
        } catch (err) {
            return next(err);
        } finally {
                        if (session) {
                await session.endSession();
            }
        }
    };

    const updateUserPassword = async (
        req: AuthRequest & {
            body: { email: string; newPassword: string; password: string };
        },
        res: Response,
        next: NextFunction
    ) => {
        try {
            const { email, newPassword, password } = req.body;

            if (!email || !newPassword || !password) {
                return next(res.err_badRequest("Campos obrigatórios não informados", {expected_format: {email: "endereco@email.com", password: "senhaAntiga", newPassword: "senhaNova"} , received: {email: email, password: password, newPassword: newPassword}}));
            }

            if (newPassword === password) {
                return next(res.err_badRequest("A nova senha não pode ser igual à senha antiga", {received: {password: req.body.password, newPassword: req.body.newPassword}}));
            }

            await userService.updateUserPassword({
                email,
                newPassword,
                password,
                _id: req.user!.id
            });

            return res.send_ok("Senha atualizada com sucesso");
        } catch (err: unknown) {
            if (err instanceof Error) {
                if (err.message === "Usuário não encontrado") {
                    return next(res.err_notFound(err.message, {expected_format: {email: "endereco@email.com", password: "senhaAntiga", newPassword: "senhaNova"} , received: {email: req.body.email, password: req.body.password, newPassword: req.body.newPassword}}));
                }
                if (
                    err.message === "A senha antiga não confere" ||
                    err.message === "A nova senha não pode ser igual à senha antiga" ||
                    err.message === "A nova senha não pode ser igual a senha antiga"
                ) {
                    return next(res.err_badRequest(err.message, {received: {password: req.body.password, newPassword: req.body.newPassword}}));
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