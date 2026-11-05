import { assertEquals, assertInstanceOf } from "jsr:@std/assert";
import type { Request, Response, NextFunction } from "npm:express";
import mongoose from "npm:mongoose";
import bcrypt from "npm:bcrypt";

import { createAuthController } from "../../controllers/authController.ts";
import { createAuthService } from "../../services/authService.ts";

const hashedPassword = await bcrypt.hash("SenhaCorreta123", 12);

const authRepositorySuccessMock = {
    getByEmail: async (email: string) => {
        if (email === "user@example.com") {
            return {
                _id: new mongoose.Types.ObjectId("507f1f77bcf86cd799439011"),
                username: "Test User",
                email: "user@example.com",
                password: hashedPassword
            } as Awaited<ReturnType<NonNullable<Parameters<typeof createAuthService>[0]>["getByEmail"]>>;
        }
        return null;
    }
};

Deno.test("AuthController", async (t) => {
    Deno.env.set("JWT_SECRET", "segredo_de_teste_unitario");

    const service = createAuthService(authRepositorySuccessMock);
    const controller = createAuthController(service);

    await t.step("POST /login - Deve realizar login com sucesso e retornar token", async () => {
        let responseData: { token?: string } = {};

        const req = {
            body: {
                email: "user@example.com",
                password: "SenhaCorreta123"
            }
        } as Request;

        const res = {
            send_ok: (_message: string, data: { token: string }) => {
                responseData = data;
                return res;
            },
            err_unauthorized: (message: string) => new Error(message)
        } as unknown as Response;

        const next: NextFunction = (error?: unknown) => {
            if (error) throw error;
        };

        await controller.login(req, res, next);

        assertEquals(typeof responseData.token, "string");
        assertEquals((responseData.token?.length ?? 0) > 10, true);
    });

    await t.step("POST /login - Deve rejeitar senha incorreta", async () => {
        let receivedError: unknown;

        const req = {
            body: {
                email: "user@example.com",
                password: "SenhaErrada"
            }
        } as Request;

        const res = {
            err_unauthorized: (message: string) => new Error(message)
        } as unknown as Response;

        const next: NextFunction = (error?: unknown) => {
            receivedError = error;
        };

        await controller.login(req, res, next);

        assertInstanceOf(receivedError, Error);
        assertEquals(receivedError.message, "Credenciais inválidas");
    });

    await t.step("POST /login - Deve rejeitar usuário inexistente", async () => {
        let receivedError: unknown;

        const req = {
            body: {
                email: "naoexiste@example.com",
                password: "SenhaCorreta123"
            }
        } as Request;

        const res = {
            err_unauthorized: (message: string) => new Error(message)
        } as unknown as Response;

        const next: NextFunction = (error?: unknown) => {
            receivedError = error;
        };

        await controller.login(req, res, next);

        assertInstanceOf(receivedError, Error);
        assertEquals(receivedError.message, "Credenciais inválidas");
    });
});