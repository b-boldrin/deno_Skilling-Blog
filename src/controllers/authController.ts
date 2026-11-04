import type { Request, Response } from "express";
import * as authService from "../services/authService.ts";

export const login = async (req: Request, res: Response) => {
    try {
    const loginResult = await authService.checkLogin(req.body);

    if (!loginResult || !loginResult.isPasswordValid) {
        return res.status(401).json({
            success: false,
            message: 'Credenciais inválidas'
        });

    }

    const { token } = loginResult;

    
    return res.status(200).json({
        message: 'Login realizado com sucesso',
        success: true,
      token
    });

    } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
    
} }