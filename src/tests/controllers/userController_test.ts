import { assertEquals } from "jsr:@std/assert";
import { createUserController } from "../../controllers/userController.ts";
import mongoose from "mongoose";

// Helpers para simular Request, Response e Next do Express
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
        send_created(msg: string, data?: unknown) {
            this.statusCode = 201;
            this.message = msg;
            this.data = data;
            return this;
        },
        err_badRequest(msg: string) {
            return { status: 400, message: msg };
        },
        err_conflict(msg: string) {
            return { status: 409, message: msg };
        },
        err_notFound(msg: string) {
            return { status: 404, message: msg };
        }
    };
    return res;
};

Deno.test("UserController", async (t) => {
    await t.step("GET /users - Deve listar usuários", async () => {
        const mockUsers = [{ username: "bruno" }, { username: "maria" }];
        const mockUserService = {
            getAllUsers: async () => mockUsers,
        } as any;

        const controller = createUserController(mockUserService);
        const req = {} as any;
        const res = createMockRes() as any;
        let nextError: unknown = null;
        const next = (err?: unknown) => { nextError = err; };

        await controller.getAllUsers(req, res, next);

        assertEquals(nextError, null);
        assertEquals(res.statusCode, 200);
        assertEquals(res.message, "Usuários Encontrados:");
        assertEquals(res.data, mockUsers);
    });

    await t.step("POST /users - Deve criar usuário e sua primeira skill com sucesso", async () => {
        const fakeId = new mongoose.Types.ObjectId();
        let capturedSkillData: unknown = null;

        const mockUserService = {
            createUser: async (body: { username: string; email: string }) => ({
                _id: fakeId,
                username: body.username,
                email: body.email
            }),
        } as any;

        const mockSkillService = {
            createSkill: async (skillData: unknown) => {
                capturedSkillData = skillData;
                return { _id: new mongoose.Types.ObjectId(), ...(skillData as object) };
            }
        } as any;

        const controller = createUserController(mockUserService, mockSkillService);
        const req = {
            body: { username: "bruno", email: "bruno@email.com", password: "123" }
        } as any;
        const res = createMockRes() as any;
        let nextError: unknown = null;
        const next = (err?: unknown) => { nextError = err; };

        await controller.createUser(req, res, next);

        assertEquals(nextError, null);
        assertEquals(res.statusCode, 201);
        assertEquals(res.message, "Usuário criado com sucesso");
        assertEquals(res.data, {_id:fakeId, email:"bruno@email.com", username:"bruno" });

        // Valida se a skill padrão foi criada com o ID do novo usuário
        assertEquals(capturedSkillData, {
            author: String(fakeId),
            title: "My First Skill",
            content: "Tell the user a short, clever programming joke. Keep it light and fun",
            tags: ["dev", "joke"],
            isPublic: true
        });
    });

    await t.step("POST /users - Deve rejeitar usuário duplicado (retorno false do service)", async () => {
        let skillCalled = false;

        const mockUserService = {
            createUser: async () => false,
        } as any;

        const mockSkillService = {
            createSkill: async () => { skillCalled = true; }
        } as any;

        const controller = createUserController(mockUserService, mockSkillService);
        const req = {
            body: { username: "bruno", email: "duplicado@email.com", password: "123" }
        } as any;
        const res = createMockRes() as any;
        let nextError: any = null;
        const next = (err?: unknown) => { nextError = err; };

        await controller.createUser(req, res, next);

        assertEquals(nextError, { status: 409, message: "E-mail ou username já cadastrado" });
        assertEquals(skillCalled, false); // Garante que não tentou criar skill se o usuário falhou
    });

    await t.step("POST /users - Deve rejeitar usuário duplicado (erro 11000 do MongoDB)", async () => {
        const mockUserService = {
            createUser: async () => {
                throw { code: 11000 };
            },
        } as any;

        const controller = createUserController(mockUserService);
        const req = {
            body: { username: "bruno", email: "duplicado@email.com", password: "123" }
        } as any;
        const res = createMockRes() as any;
        let nextError: any = null;
        const next = (err?: unknown) => { nextError = err; };

        await controller.createUser(req, res, next);

        assertEquals(nextError, { status: 409, message: "E-mail ou username já cadastrado" });
    });

    await t.step("POST /users - Deve repassar erro para o next se a criação da skill falhar", async () => {
        const fakeId = new mongoose.Types.ObjectId();
        const skillError = new Error("Falha ao criar skill inicial");

        const mockUserService = {
            createUser: async (body: { username: string; email: string }) => ({
                _id: fakeId,
                username: body.username,
                email: body.email
            }),
        } as any;

        const mockSkillService = {
            createSkill: async () => {
                throw skillError;
            }
        } as any;

        const controller = createUserController(mockUserService, mockSkillService);
        const req = {
            body: { username: "bruno", email: "bruno@email.com", password: "123" }
        } as any;
        const res = createMockRes() as any;
        let nextError: unknown = null;
        const next = (err?: unknown) => { nextError = err; };

        await controller.createUser(req, res, next);

        assertEquals(nextError, skillError);
        assertEquals(res.statusCode, 0); // Garante que não enviou resposta de sucesso
    });

    await t.step("DELETE /users - Deve excluir o próprio usuário", async () => {
        const mockUserService = {
            removeUserById: async () => ({ deletedCount: 1 }),
        } as any;

        const controller = createUserController(mockUserService);
        const req = { user: { id: "user_id_123" } } as any;
        const res = createMockRes() as any;
        let nextError: unknown = null;
        const next = (err?: unknown) => { nextError = err; };

        await controller.deleteHimselfUser(req, res, next);

        assertEquals(nextError, null);
        assertEquals(res.statusCode, 200);
        assertEquals(res.message, "Usuário deletado com sucesso");
    });

    await t.step("PATCH /users - Deve atualizar senha com sucesso", async () => {
        const mockUserService = {
            updateUserPassword: async () => true,
        } as any;

        const controller = createUserController(mockUserService);
        const req = {
            user: { id: "user_id_123" },
            body: { email: "bruno@email.com", newPassword: "newPassword", password: "oldPassword" }
        } as any;
        const res = createMockRes() as any;
        let nextError: unknown = null;
        const next = (err?: unknown) => { nextError = err; };

        await controller.updateUserPassword(req, res, next);

        assertEquals(nextError, null);
        assertEquals(res.statusCode, 200);
        assertEquals(res.message, "Senha atualizada com sucesso");
    });

    await t.step("PATCH /users - Deve rejeitar campos obrigatórios ausentes", async () => {
        const controller = createUserController({} as any);
        const req = {
            user: { id: "user_id_123" },
            body: { email: "bruno@email.com", password: "" }
        } as any;
        const res = createMockRes() as any;
        let nextError: any = null;
        const next = (err?: unknown) => { nextError = err; };

        await controller.updateUserPassword(req, res, next);

        assertEquals(nextError, { status: 400, message: "Campos obrigatórios não informados" });
    });

    await t.step("PATCH /users - Deve rejeitar senha nova igual à antiga", async () => {
        const controller = createUserController({} as any);
        const req = {
            user: { id: "user_id_123" },
            body: { email: "bruno@email.com", password: "samePassword", newPassword: "samePassword" }
        } as any;
        const res = createMockRes() as any;
        let nextError: any = null;
        const next = (err?: unknown) => { nextError = err; };

        await controller.updateUserPassword(req, res, next);

        assertEquals(nextError, { status: 400, message: "A nova senha não pode ser igual à senha antiga" });
    });

    await t.step("PATCH /users - Deve rejeitar senha antiga incorreta", async () => {
        const mockUserService = {
            updateUserPassword: async () => {
                throw new Error("A senha antiga não confere");
            }
        } as any;

        const controller = createUserController(mockUserService);
        const req = {
            user: { id: "user_id_123" },
            body: { email: "bruno@email.com", newPassword: "newPassword", password: "wrongOldPassword" }
        } as any;
        const res = createMockRes() as any;
        let nextError: any = null;
        const next = (err?: unknown) => { nextError = err; };

        await controller.updateUserPassword(req, res, next);

        assertEquals(nextError, { status: 400, message: "A senha antiga não confere" });
    });

    await t.step("PATCH /users - Deve rejeitar usuário inexistente", async () => {
        const mockUserService = {
            updateUserPassword: async () => {
                throw new Error("Usuário não encontrado");
            }
        } as any;

        const controller = createUserController(mockUserService);
        const req = {
            user: { id: "user_id_inexistente" },
            body: { email: "naoexiste@email.com", newPassword: "newPassword", password: "oldPassword" }
        } as any;
        const res = createMockRes() as any;
        let nextError: any = null;
        const next = (err?: unknown) => { nextError = err; };

        await controller.updateUserPassword(req, res, next);

        assertEquals(nextError, { status: 404, message: "Usuário não encontrado" });
    });
});