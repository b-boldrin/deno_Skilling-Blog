import type { Request, Response, NextFunction } from "express";
import authServiceDefault from "../services/authService.ts";

export const createAuthController = (authService = authServiceDefault) => {
    const login = async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.body?.email || !req.body?.password) {
                return next(res.err_badRequest("Campos obrigatórios não informados", {"expected_format": {email : "endereco@email.com", password : "suasenha123" }}) );
            }

            const loginResult = await authService.checkLogin(req.body);

            if (!loginResult.isPasswordValid) {
                return next(res.err_unauthorized("Credenciais inválidas"), {email : req.body.email});
            }

            return res.send_ok("Login realizado com sucesso", {
                token: loginResult.token
            });
        } catch (error) {
            return next(error);
        }
    };

    return { login };
};

const authController = createAuthController();
export default authController;