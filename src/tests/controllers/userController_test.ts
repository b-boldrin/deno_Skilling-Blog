import { assertEquals } from "jsr:@std/assert";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { createUserController } from "../../controllers/userController.ts";
import { createUserService } from "../../services/userService.ts";
import { createSkillService } from "../../services/skillService.ts";

const createMockRes = () => {
    const res: Record<string, unknown> = {
        statusCode: 0,
        message: "",
        data: null,
        locals: {},
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
    const oldHashedPassword = await bcrypt.hash("oldPassword", 10);

    await t.step("GET /users - Deve listar usuários (mock apenas findAll)", async () => {
        const mockUsers = [{ username: "bruno" }, { username: "maria" }];
        const userService = createUserService({
            findAll: async () => mockUsers as any
        } as any);

        const controller = createUserController(userService);
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

    await t.step("POST /users - Deve criar usuário e sua primeira skill com sucesso (mock apenas create)", async () => {
        const fakeId = new mongoose.Types.ObjectId();
        let capturedSkillData: unknown = null;

        const userService = createUserService({
            create: async (userData: any) => ({
                _id: fakeId,
                username: userData.username,
                email: userData.email
            })
        } as any);

        const skillService = createSkillService({
            create: async (skillData: any) => {
                capturedSkillData = skillData;
                return { _id: new mongoose.Types.ObjectId(), ...skillData } as any;
            }
        } as any);

        const controller = createUserController(userService, skillService);
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
        assertEquals(res.data, { _id: fakeId, email: "bruno@email.com", username: "bruno" });
        assertEquals(capturedSkillData, {
            author: String(fakeId),
            title: "My First Skill",
            content: "Tell the user a short, clever programming joke. Keep it light and fun",
            tags: ["dev", "joke"],
            isPublic: true
        });
    });

    await t.step("POST /users - Deve rejeitar usuário duplicado (retorno false do repositório)", async () => {
        let skillCalled = false;

        const userService = createUserService({
            create: async () => false
        } as any);

        const skillService = createSkillService({
            create: async () => { skillCalled = true; return {} as any; }
        } as any);

        const controller = createUserController(userService, skillService);
        const req = {
            body: { username: "bruno", email: "duplicado@email.com", password: "123" }
        } as any;
        const res = createMockRes() as any;
        let nextError: any = null;
        const next = (err?: unknown) => { nextError = err; };

        await controller.createUser(req, res, next);

        assertEquals(nextError, { status: 409, message: "E-mail ou username já cadastrado" });
        assertEquals(skillCalled, false);
    });

    await t.step("POST /users - Deve rejeitar usuário duplicado (erro 11000 do MongoDB)", async () => {
        const userService = createUserService({
            create: async () => { throw { code: 11000 }; }
        } as any);

        const controller = createUserController(userService);
        const req = {
            body: { username: "bruno", email: "duplicado@email.com", password: "123" }
        } as any;
        const res = createMockRes() as any;
        let nextError: any = null;
        const next = (err?: unknown) => { nextError = err; };

        await controller.createUser(req, res, next);

        assertEquals(nextError, { status: 409, message: "E-mail ou username já cadastrado" });
    });

    await t.step("DELETE /users - Deve excluir o próprio usuário e suas skills (mock removeById e removeMany)", async () => {
        let deletedSkillsForAuthor: string | null = null;

        const userService = createUserService({
            removeById: async () => ({ acknowledged: true, deletedCount: 1 })
        } as any);

        const skillService = createSkillService({
            removeMany: async (authorId: string) => {
                deletedSkillsForAuthor = authorId;
                return { acknowledged: true, deletedCount: 2 };
            }
        } as any);

        const controller = createUserController(userService, skillService);
        const req = { user: { id: "user_id_123" } } as any;
        const res = createMockRes() as any;
        let nextError: unknown = null;
        const next = (err?: unknown) => { nextError = err; };

        await controller.deleteHimselfUser(req, res, next);

        assertEquals(nextError, null);
        assertEquals(res.statusCode, 200);
        assertEquals(res.message, "Usuário deletado com sucesso");
        assertEquals(deletedSkillsForAuthor, "user_id_123");
    });

    await t.step("DELETE /users - Deve retornar 404 se o usuário a ser deletado não existir", async () => {
        let skillsDeletedCalled = false;

        const userService = createUserService({
            removeById: async () => ({ acknowledged: true, deletedCount: 0 })
        } as any);

        const skillService = createSkillService({
            removeMany: async () => {
                skillsDeletedCalled = true;
                return { acknowledged: true, deletedCount: 0 };
            }
        } as any);

        const controller = createUserController(userService, skillService);
        const req = { user: { id: "user_id_inexistente" } } as any;
        const res = createMockRes() as any;
        let nextError: any = null;
        const next = (err?: unknown) => { nextError = err; };

        await controller.deleteHimselfUser(req, res, next);

        assertEquals(nextError, { status: 404, message: "Usuário não encontrado" });
        assertEquals(skillsDeletedCalled, false);
    });

    await t.step("PATCH /users - Deve atualizar senha com sucesso (mock getLastPasswordByIdAndEmail e updatePassword)", async () => {
        const userService = createUserService({
            getLastPasswordByIdAndEmail: async () => ({
                _id: "user_id_123",
                email: "bruno@email.com",
                password: oldHashedPassword
            } as any),
            updatePassword: async () => true
        } as any);

        const controller = createUserController(userService);
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
        const controller = createUserController(createUserService({} as any));
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
        const controller = createUserController(createUserService({} as any));
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

    await t.step("PATCH /users - Deve rejeitar senha antiga incorreta (via Service + Repository)", async () => {
        const userService = createUserService({
            getLastPasswordByIdAndEmail: async () => ({
                _id: "user_id_123",
                email: "bruno@email.com",
                password: oldHashedPassword
            } as any)
        } as any);

        const controller = createUserController(userService);
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

    await t.step("PATCH /users - Deve rejeitar usuário inexistente (via Service + Repository)", async () => {
        const userService = createUserService({
            getLastPasswordByIdAndEmail: async () => null
        } as any);

        const controller = createUserController(userService);
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