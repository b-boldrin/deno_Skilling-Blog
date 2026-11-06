import { assertEquals } from "jsr:@std/assert";
import { createAuthController } from "../../controllers/authController.ts";

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
    await t.step("POST /login - Deve realizar login com sucesso e retornar token", async () => {
        const mockAuthService = {
            checkLogin: async () => ({
                isPasswordValid: true as const,
                token: "jwt_token_valido_123"
            })
        } as any;

        const controller = createAuthController(mockAuthService);
        const req = {
            body: { email: "bruno@email.com", password: "123" }
        } as any;
        const res = createMockRes() as any;
        let nextError: unknown = null;
        const next = (err?: unknown) => {
            nextError = err;
        };

        await controller.login(req, res, next);

        assertEquals(nextError, null);
        assertEquals(res.statusCode, 200);
        assertEquals(res.message, "Login realizado com sucesso");
        assertEquals(res.data, { token: "jwt_token_valido_123" });
    });

    await t.step("POST /login - Deve rejeitar requisição sem email", async () => {
        const controller = createAuthController({} as any);
        const req = {
            body: { password: "123" }
        } as any;
        const res = createMockRes() as any;
        let nextError: unknown = null;
        const next = (err?: unknown) => {
            nextError = err;
        };

        await controller.login(req, res, next);

        assertEquals(nextError, {
            status: 400,
            message: "Campos obrigatórios não informados"
        });
    });

    await t.step("POST /login - Deve rejeitar requisição sem senha", async () => {
        const controller = createAuthController({} as any);
        const req = {
            body: { email: "bruno@email.com" }
        } as any;
        const res = createMockRes() as any;
        let nextError: unknown = null;
        const next = (err?: unknown) => {
            nextError = err;
        };

        await controller.login(req, res, next);

        assertEquals(nextError, {
            status: 400,
            message: "Campos obrigatórios não informados"
        });
    });

    await t.step("POST /login - Deve rejeitar credenciais inválidas (401)", async () => {
        const mockAuthService = {
            checkLogin: async () => ({
                isPasswordValid: false as const
            })
        } as any;

        const controller = createAuthController(mockAuthService);
        const req = {
            body: { email: "bruno@email.com", password: "senha_errada" }
        } as any;
        const res = createMockRes() as any;
        let nextError: unknown = null;
        const next = (err?: unknown) => {
            nextError = err;
        };

        await controller.login(req, res, next);

        assertEquals(nextError, {
            status: 401,
            message: "Credenciais inválidas"
        });
    });

    await t.step("POST /login - Deve repassar erro inesperado para o next", async () => {
        const unexpectedError = new Error("Falha no banco de dados");
        const mockAuthService = {
            checkLogin: async () => {
                throw unexpectedError;
            }
        } as any;

        const controller = createAuthController(mockAuthService);
        const req = {
            body: { email: "bruno@email.com", password: "123" }
        } as any;
        const res = createMockRes() as any;
        let nextError: unknown = null;
        const next = (err?: unknown) => {
            nextError = err;
        };

        await controller.login(req, res, next);

        assertEquals(nextError, unexpectedError);
    });
});