import type { Request, Response, NextFunction } from "express";
import * as userService from "../services/userService.ts";
import type { AuthRequest } from "../middleware/authValidator.ts";
import { string } from "@zarco/isness";




export const createUser = async (req: Request, res: Response, next: NextFunction) => {


    try {

        const newUser = await userService.createUser(req.body)

        if (newUser === false) {

            return next(res.err_conflict("E-mail ou username já cadastrado"));

        }

        res.send_created("Usuário criado com sucesso", newUser.username);

    } catch (err : any) {
        if (err.code === 11000) {
            return next(res.err_conflict("E-mail ou username já cadastrado"));
        }
        
        return next(res.err_internal(err));
    }
    
};

export const deleteHimselfUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
    

    try {
        
        const userId = req.user!.id

        const deletedUser = await userService.removeUserById(userId);

        if (!deletedUser) {
            return next(res.err_notFound("Usuário não encontrado"));
        }
        
        res.send_ok("Usuário deletado com sucesso", deletedUser);

    } catch (err) {
        return next(res.err_internal(err))
    }

};



export const updateUserPassword = async (
    req: AuthRequest & { body: { email: string; password: string; lastPassword: string } },
    res: Response,
    next: NextFunction
) => {

    try {

        const { email, password, lastPassword } = req.body;

        if (!email || !password || !lastPassword) {
            return next(
                res.err_badRequest("Campos obrigatórios não informados")
            );
        }

        if (password === lastPassword) {
            return next(
                res.err_badRequest(
                    "A nova senha não pode ser igual à senha antiga"
                )
            );
        }

        const userData = {
            email,
            password,
            lastPassword,
            _id: req.user!.id,
            
        };

        await userService.updateUserPassword(userData);

        return res.send_ok("Senha atualizada com sucesso");

    } catch (err: any) {

        if (
            err.message === "A senha antiga não confere" ||
            err.message === "A nova senha não pode ser igual a senha antiga"
        ) {
            return next(res.err_badRequest(err.message));
        }

        return next(res.err_internal(err));
    }
};



export const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {

    try {
        const users = await userService.getAllUsers();
        
        res.send_ok("Usuários Encontrados:", users);
    }
    catch (err) {
        return next(res.err_internal("Erro ao buscar usuários"));
    }
    

    
};


