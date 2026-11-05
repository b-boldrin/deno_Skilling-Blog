import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface JwtPayload {
    id: string;
}

export interface AuthRequest extends Request {
    user?: {
        id: string;
    };
    headers?: any
}

export default function authMiddleware(
    req: AuthRequest,
    res: Response,
    next: NextFunction
) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return next(res.err_unauthorized("Token não informado"));
        }

        const [scheme, token] = authHeader.split(" ");

        if (scheme !== "Bearer" || !token) {
            return next(res.err_unauthorized("Token inválido"));
        }

        const secret = Deno.env.get("JWT_SECRET");

        if (!secret) {
            throw new Error("JWT_SECRET não configurado");
        }

        const decoded = jwt.verify(token, secret) as JwtPayload;

        if (!decoded.id || typeof decoded.id !== "string") {
            return next(res.err_unauthorized("Token inválido"));
        }

        req.user = {
            id: decoded.id
        };

        return next();

    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            return next(res.err_unauthorized("Token expirado"));
        }

        if (error instanceof jwt.JsonWebTokenError) {
            return next(res.err_unauthorized("Token inválido"));
        }

        return next(error);
    }
}