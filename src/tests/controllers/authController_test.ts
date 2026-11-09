import { assertEquals, assertExists } from "jsr:@std/assert";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import { createAuthController } from "../../controllers/authController.ts";
import { createAuthService } from "../../services/authService.ts";

const createMockRes = () => {
    const res: Record<string, unknown> = {
        statusCode: 0,
        message: "",
        data: null,
        send_ok(msg: string, data?: unknown) {
            this.statusCode = 200;
            this.message = msg;
            this.data = data;
            return this;
        },
        err_badRequest(msg: string) {
            return { status: 400, message: msg };
        },
        err_unauthorized(msg: string) {
            return { status: 401, message: msg };
        }
    };
    return res;
};

Deno.test("AuthController", async (t) => {
    const hashedPassword = await bcrypt.hash("123", 10);

    await t.step("POST /login - Deve realizar login com sucesso e retornar token", async () => {
        
        const authService = createAuthService({
            getByEmail: async (email: string) => ({
                _id: new mongoose.Types.ObjectId("507f1f77bcf86cd799439011"),
                username: "bruno",
                email,
                password: hashedPassword
            } as any)
        });

        const controller = createAuthController(authService);
        const req = {
            body: { email: "bruno@email.com", password: "123" }
        } as any;
        const res = createMockRes() as any;
        let nextError: unknown = null;
        const next = (err?: unknown) => { nextError = err; };

        await controller.login(req, res, next);

        assertEquals(nextError, null);
        assertEquals(res.statusCode, 200);
        assertEquals(res.message, "Login realizado com sucesso");
        assertExists((res.data as { token: string }).token);
    });

    await t.step("POST /login - Deve rejeitar requisição sem email", async () => {
        const authService = createAuthService({} as any);
        const controller = createAuthController(authService);
        const req = { body: { password: "123" } } as any;
        const res = createMockRes() as any;
        let nextError: unknown = null;
        const next = (err?: unknown) => { nextError = err; };

        await controller.login(req, res, next);

        assertEquals(nextError, {
            status: 400,
            message: "Campos obrigatórios não informados"
        });
    });

    await t.step("POST /login - Deve rejeitar requisição sem senha", async () => {
        const authService = createAuthService({} as any);
        const controller = createAuthController(authService);
        const req = { body: { email: "bruno@email.com" } } as any;
        const res = createMockRes() as any;
        let nextError: unknown = null;
        const next = (err?: unknown) => { nextError = err; };

        await controller.login(req, res, next);

        assertEquals(nextError, {
            status: 400,
            message: "Campos obrigatórios não informados"
        });
    });

    await t.step("POST /login - Deve rejeitar quando e-mail não existe (401)", async () => {
        const authService = createAuthService({
            getByEmail: async () => null
        });

        const controller = createAuthController(authService);
        const req = {
            body: { email: "naoexiste@email.com", password: "123" }
        } as any;
        const res = createMockRes() as any;
        let nextError: unknown = null;
        const next = (err?: unknown) => { nextError = err; };

        await controller.login(req, res, next);

        assertEquals(nextError, {
            status: 401,
            message: "Credenciais inválidas"
        });
    });

    await t.step("POST /login - Deve rejeitar quando a senha está incorreta (401)", async () => {
        const authService = createAuthService({
            getByEmail: async (email: string) => ({
                _id: new mongoose.Types.ObjectId("507f1f77bcf86cd799439011"),
                username: "bruno",
                email,
                password: hashedPassword
            } as any)
        });

        const controller = createAuthController(authService);
        const req = {
            body: { email: "bruno@email.com", password: "senha_errada" }
        } as any;
        const res = createMockRes() as any;
        let nextError: unknown = null;
        const next = (err?: unknown) => { nextError = err; };

        await controller.login(req, res, next);

        assertEquals(nextError, {
            status: 401,
            message: "Credenciais inválidas"
        });
    });
});