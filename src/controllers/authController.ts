import type { Request, Response, NextFunction} from "express";
import * as authService from "../services/authService.ts";

export const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
    const loginResult = await authService.checkLogin(req.body) as { isPasswordValid: boolean; token: string };

    if (!loginResult.isPasswordValid) {

         return next(res.err_unauthorized("Credenciais inválidas"));
    }

    const { token } = loginResult;

    
    return res.send_ok('Login realizado com sucesso', { token });

    } catch (error) {
       return next(error)
} }