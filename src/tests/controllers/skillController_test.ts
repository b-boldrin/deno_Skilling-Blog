import { assertEquals } from "jsr:@std/assert";
import type { Request, Response, NextFunction } from "npm:express";
import mongoose from "mongoose";
import { createSkillController } from "../../controllers/skillController.ts";
import { createSkillService } from "../../services/skillService.ts";

Deno.test("SkillController", async (t) => {

    await t.step("GET /skills - Deve listar skills do usuário (mock apenas findAllByUserId)", async () => {
        let responseData: any;

        const service = createSkillService({
            findAllByUserId: async (_userId: string, _page?: number) => [
                { _id: "507f1f77bcf86cd799439011", title: "Minha Skill", author: "user123", isPublic: true } as any
            ]
        } as any);
        const controller = createSkillController(service);

        const req = {
            user: { id: "user123" },
            query: {}
        } as unknown as Request;

        const res = {
            locals: {},
            send_ok: (_message: string, data: any) => {
                responseData = data;
                return res;
            }
        } as unknown as Response;

        const next: NextFunction = (error?: any) => {
            if (error) throw error;
        };

        await controller.getAllMySkills(req, res, next);

        assertEquals(responseData.length, 1);
        assertEquals(responseData[0].title, "Minha Skill");
    });

    await t.step("GET /skills - Deve rejeitar paginação inválida", async () => {
        let receivedError: any;
        const controller = createSkillController(createSkillService({} as any));

        const req = {
            user: { id: "user123" },
            query: { page: "0" }
        } as unknown as Request;

        const res = {
            locals: {},
            err_badRequest: (message: string) => new Error(message)
        } as unknown as Response;

        const next: NextFunction = (error?: any) => {
            receivedError = error;
        };

        await controller.getAllMySkills(req, res, next);

        assertEquals(receivedError instanceof Error, true);
        assertEquals(receivedError.message, "Paginação inválida");
    });

    await t.step("GET /skills (findSkillById) - Sem query.skillId deve pular para a próxima rota com next('route')", async () => {
        let nextArg: any;
        const controller = createSkillController(createSkillService({} as any));

        const req = { query: {} } as unknown as Request;
        const res = { locals: {} } as unknown as Response;
        const next: NextFunction = (arg?: any) => { nextArg = arg; };

        await controller.findSkillById(req, res, next);

        assertEquals(nextArg, "route");
    });

    await t.step("GET /skills (findSkillById) - Deve rejeitar skillId com formato inválido", async () => {
        let receivedError: any;
        const controller = createSkillController(createSkillService({} as any));

        const req = {
            query: { skillId: "id_invalido_123" }
        } as unknown as Request;

        const res = {
            locals: {},
            err_notFound: (message: string) => new Error(message)
        } as unknown as Response;

        const next: NextFunction = (error?: any) => {
            receivedError = error;
        };

        await controller.findSkillById(req, res, next);

        assertEquals(receivedError instanceof Error, true);
        assertEquals(receivedError.message, "Id não é valido");
    });

    await t.step("GET /skills (findSkillById) - Deve retornar 404 quando a skill não existir no banco", async () => {
        let receivedError: any;
        const validId = "507f1f77bcf86cd799439011";

        const service = createSkillService({
            findSkillById: async () => null
        } as any);
        const controller = createSkillController(service);

        const req = {
            query: { skillId: validId }
        } as unknown as Request;

        const res = {
            locals: {},
            err_notFound: (message: string) => new Error(message)
        } as unknown as Response;

        const next: NextFunction = (error?: any) => {
            receivedError = error;
        };

        await controller.findSkillById(req, res, next);

        assertEquals(receivedError instanceof Error, true);
        assertEquals(receivedError.message, "Id não é valido");
    });

    await t.step("GET /skills (findSkillById) - Deve retornar uma skill pública diretamente", async () => {
        let responseData: any;
        const validId = "507f1f77bcf86cd799439011";

        const service = createSkillService({
            findSkillById: async (skillId: mongoose.Types.ObjectId) => ({
                _id: skillId,
                title: "Aprendendo Deno",
                author: "user123",
                isPublic: true
            } as any)
        } as any);
        const controller = createSkillController(service);

        const req = {
            query: { skillId: validId }
        } as unknown as Request;

        const res = {
            locals: {},
            send_ok: (_message: string, data: any) => {
                responseData = data;
                return res;
            }
        } as unknown as Response;

        const next: NextFunction = (error?: any) => {
            if (error) throw error;
        };

        await controller.findSkillById(req, res, next);

        assertEquals(String(responseData._id), validId);
        assertEquals(responseData.isPublic, true);
    });

    await t.step("GET /skills (findSkillById) - Skill privada deve ser salva em res.locals.targetSkill e chamar next('route')", async () => {
        let nextArg: any;
        const validId = "507f1f77bcf86cd799439011";
        const privateSkill = {
            _id: new mongoose.Types.ObjectId(validId),
            title: "Skill Secreta",
            author: "user123",
            isPublic: false
        };

        const service = createSkillService({
            findSkillById: async () => privateSkill as any
        } as any);
        const controller = createSkillController(service);

        const req = { query: { skillId: validId } } as unknown as Request;
        const res = { locals: {} } as unknown as Response;
        const next: NextFunction = (arg?: any) => { nextArg = arg; };

        await controller.findSkillById(req, res, next);

        assertEquals(nextArg, "route");
        assertEquals(res.locals.targetSkill, privateSkill);
    });

    await t.step("GET /skills (getAllMySkills) - Deve retornar skill privada de res.locals se o usuário for o autor", async () => {
        let responseData: any;
        const controller = createSkillController(createSkillService({} as any));
        const targetSkill = {
            _id: "507f1f77bcf86cd799439011",
            title: "Minha Skill Privada",
            author: "user123",
            isPublic: false
        };

        const req = {
            user: { id: "user123" },
            query: { skillId: "507f1f77bcf86cd799439011" }
        } as unknown as Request;

        const res = {
            locals: { targetSkill },
            send_ok: (_message: string, data: any) => {
                responseData = data;
                return res;
            }
        } as unknown as Response;

        const next: NextFunction = (error?: any) => {
            if (error) throw error;
        };

        await controller.getAllMySkills(req, res, next);

        assertEquals(responseData, targetSkill);
    });

    await t.step("GET /skills (getAllMySkills) - Deve bloquear acesso à skill privada se o usuário não for o autor", async () => {
        let receivedError: any;
        const controller = createSkillController(createSkillService({} as any));
        const targetSkill = {
            _id: "507f1f77bcf86cd799439011",
            title: "Skill Privada de Outro",
            author: "outro_usuario",
            isPublic: false
        };

        const req = {
            user: { id: "user123" },
            query: { skillId: "507f1f77bcf86cd799439011" }
        } as unknown as Request;

        const res = {
            locals: { targetSkill },
            err_unauthorized: (message: string) => new Error(message)
        } as unknown as Response;

        const next: NextFunction = (error?: any) => {
            receivedError = error;
        };

        await controller.getAllMySkills(req, res, next);

        assertEquals(receivedError instanceof Error, true);
        assertEquals(receivedError.message, "Você não tem permissão para acessar essa skill");
    });

    await t.step("POST /skills - Deve criar uma Skill (mock apenas create)", async () => {
        let responseData: any;

        const service = createSkillService({
            create: async (data: any) => data
        } as any);
        const controller = createSkillController(service);

        const req = {
            user: { id: "user123" },
            body: {
                title: "Aprendendo Deno",
                content: "Conteúdo sobre Deno",
                tags: ["deno", "typescript"],
                isPublic: true
            }
        } as unknown as Request;

        const res = {
            send_created: (_message: string, data: any) => {
                responseData = data;
                return res;
            }
        } as unknown as Response;

        const next: NextFunction = (error?: any) => {
            if (error) throw error;
        };

        await controller.createSkill(req, res, next);

        assertEquals(responseData.title, "Aprendendo Deno");
        assertEquals(responseData.author, "user123");
    });

    await t.step("POST /skills - Não deve criar Skill com array de tags vazio", async () => {
        let receivedError: any;
        const controller = createSkillController(createSkillService({} as any));

        const req = {
            user: { id: "user123" },
            body: {
                title: "Aprendendo Deno",
                content: "Conteúdo sobre Deno",
                tags: []
            }
        } as unknown as Request;

        const res = {
            err_badRequest: (message: string) => new Error(message)
        } as unknown as Response;

        const next: NextFunction = (error?: any) => {
            receivedError = error;
        };

        await controller.createSkill(req, res, next);

        assertEquals(receivedError instanceof Error, true);
        assertEquals(receivedError.message, "Campos obrigatórios não informados");
    });

    await t.step("PATCH /skills - Deve atualizar uma Skill (mock apenas update)", async () => {
        let responseMessage: string | undefined;

        const service = createSkillService({
            update: async () => ({
                acknowledged: true,
                matchedCount: 1,
                modifiedCount: 1,
                upsertedCount: 0,
                upsertedId: null
            })
        } as any);
        const controller = createSkillController(service);

        const req = {
            user: { id: "user123" },
            body: {
                _id: "507f1f77bcf86cd799439011",
                title: "Deno Avançado",
                content: "Conteúdo atualizado",
                tags: ["deno"]
            }
        } as unknown as Request;

        const res = {
            send_ok: (message: string) => {
                responseMessage = message;
                return res;
            }
        } as unknown as Response;

        const next: NextFunction = (error?: any) => {
            if (error) throw error;
        };

        await controller.updateSkill(req, res, next);

        assertEquals(responseMessage, "Skill Editada com sucesso");
    });

    await t.step("PATCH /skills - Deve rejeitar ID inválido", async () => {
        let receivedError: any;
        const controller = createSkillController(createSkillService({} as any));

        const req = {
            user: { id: "user123" },
            body: { _id: "id-invalido", title: "Deno Avançado" }
        } as unknown as Request;

        const res = {
            err_notFound: (message: string) => new Error(message)
        } as unknown as Response;

        const next: NextFunction = (error?: any) => {
            receivedError = error;
        };

        await controller.updateSkill(req, res, next);

        assertEquals(receivedError instanceof Error, true);
        assertEquals(receivedError.message, "Id não é valido");
    });

    await t.step("PATCH /skills - Deve rejeitar Skill inexistente", async () => {
        let receivedError: any;

        const service = createSkillService({
            update: async () => ({
                acknowledged: true,
                matchedCount: 0,
                modifiedCount: 0,
                upsertedCount: 0,
                upsertedId: null
            })
        } as any);
        const controller = createSkillController(service);

        const req = {
            user: { id: "user123" },
            body: { _id: "507f1f77bcf86cd799439011", title: "Deno Avançado" }
        } as unknown as Request;

        const res = {
            err_notFound: (message: string) => new Error(message)
        } as unknown as Response;

        const next: NextFunction = (error?: any) => {
            receivedError = error;
        };

        await controller.updateSkill(req, res, next);

        assertEquals(receivedError instanceof Error, true);
        assertEquals(receivedError.message, "Skill não encontrada");
    });

    await t.step("DELETE /skills - Deve excluir uma Skill (mock apenas remove)", async () => {
        let responseData: any;

        const service = createSkillService({
            remove: async () => ({ acknowledged: true, deletedCount: 1 })
        } as any);
        const controller = createSkillController(service);

        const req = {
            user: { id: "user123" },
            body: { _id: "507f1f77bcf86cd799439011" }
        } as unknown as Request;

        const res = {
            send_ok: (_message: string, data: any) => {
                responseData = data;
                return res;
            }
        } as unknown as Response;

        const next: NextFunction = (error?: any) => {
            if (error) throw error;
        };

        await controller.deleteSkill(req, res, next);

        assertEquals(responseData.deletedCount, 1);
    });

    await t.step("DELETE /skills - Deve rejeitar ID inválido (Corrigido para err_badRequest)", async () => {
        let receivedError: any;
        const controller = createSkillController(createSkillService({} as any));

        const req = {
            user: { id: "user123" },
            body: { _id: "id-invalido" }
        } as unknown as Request;

        // AQUI ESTAVA O BUG: deleteSkill chama err_badRequest para ID inválido, não err_notFound
        const res = {
            err_badRequest: (message: string) => new Error(message)
        } as unknown as Response;

        const next: NextFunction = (error?: any) => {
            receivedError = error;
        };

        await controller.deleteSkill(req, res, next);

        assertEquals(receivedError instanceof Error, true);
        assertEquals(receivedError.message, "Id não é valido");
    });

    await t.step("DELETE /skills - Deve rejeitar Skill inexistente", async () => {
        let receivedError: any;

        const service = createSkillService({
            remove: async () => ({ acknowledged: true, deletedCount: 0 })
        } as any);
        const controller = createSkillController(service);

        const req = {
            user: { id: "user123" },
            body: { _id: "507f1f77bcf86cd799439011" }
        } as unknown as Request;

        const res = {
            err_notFound: (message: string) => new Error(message)
        } as unknown as Response;

        const next: NextFunction = (error?: any) => {
            receivedError = error;
        };

        await controller.deleteSkill(req, res, next);

        assertEquals(receivedError instanceof Error, true);
        assertEquals(receivedError.message, "Skill não encontrada");
    });
});