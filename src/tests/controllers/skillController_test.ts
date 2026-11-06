import { assertEquals } from "jsr:@std/assert";
import type { Request, Response, NextFunction } from "npm:express";
import mongoose from "mongoose";
import { createSkillController } from "../../controllers/skillController.ts";
import { createSkillService } from "../../services/skillService.ts";
import { skillRepositoryMock } from "../mocks/skillRepositoryMock.ts";

const skillRepositoryNotFoundMock = {
    findAllByUserId: async () => [],
    findAllPublic: async () => [],
    findSkillById: async () => null,
    create: async (data: any) => data,
    remove: async () => ({
        acknowledged: true,
        deletedCount: 0
    }),
    removeMany: async () => ({
        acknowledged: true,
        deletedCount: 0
    }),
    update: async () => ({
        acknowledged: true,
        matchedCount: 0,
        modifiedCount: 0,
        upsertedCount: 0,
        upsertedId: null
    })
};

const notFoundService = createSkillService(skillRepositoryNotFoundMock);
const notFoundController = createSkillController(notFoundService);

Deno.test("SkillController", async (t) => {
    const service = createSkillService(skillRepositoryMock);
    const controller = createSkillController(service);

    await t.step("GET /skills - Deve listar skills do usuário", async () => {
        let responseData: any;

        const req = {
            user: { id: "user123" },
            query: {}
        } as unknown as Request;

        const res = {
            locals: {},
            send_ok: (_message: string, data: any) => {
                responseData = data;
                return res;
            },
            err_badRequest: (message: string) => new Error(message)
        } as unknown as Response;

        const next: NextFunction = (error?: any) => {
            if (error) throw error;
        };

        await controller.getAllMySkills(req, res, next);

        assertEquals(responseData, []);
    });

    await t.step("GET /skills - Deve rejeitar paginação inválida", async () => {
        let receivedError: any;

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

        const req = {
            query: {}
        } as unknown as Request;

        const res = {
            locals: {}
        } as unknown as Response;

        const next: NextFunction = (arg?: any) => {
            nextArg = arg;
        };

        await controller.findSkillById(req, res, next);

        assertEquals(nextArg, "route");
    });

    await t.step("GET /skills (findSkillById) - Deve retornar uma skill pública diretamente", async () => {
        let responseData: any;
        const validId = "507f1f77bcf86cd799439011";

        const req = {
            query: { skillId: validId }
        } as unknown as Request;

        const res = {
            locals: {},
            send_ok: (_message: string, data: any) => {
                responseData = data;
                return res;
            },
            err_notFound: (message: string) => new Error(message)
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

        const privateService = createSkillService({
            ...skillRepositoryMock,
            findSkillById: async () => privateSkill as any
        });
        const privateController = createSkillController(privateService);

        const req = {
            query: { skillId: validId }
        } as unknown as Request;

        const res = {
            locals: {},
            send_ok: () => res,
            err_notFound: (message: string) => new Error(message)
        } as unknown as Response;

        const next: NextFunction = (arg?: any) => {
            nextArg = arg;
        };

        await privateController.findSkillById(req, res, next);

        assertEquals(nextArg, "route");
        assertEquals(res.locals.targetSkill, privateSkill);
    });

    await t.step("GET /skills (getAllMySkills) - Deve retornar skill privada de res.locals se o usuário for o autor", async () => {
        let responseData: any;
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
            },
            err_unauthorized: (message: string) => new Error(message)
        } as unknown as Response;

        const next: NextFunction = (error?: any) => {
            if (error) throw error;
        };

        await controller.getAllMySkills(req, res, next);

        assertEquals(responseData, targetSkill);
    });

    await t.step("GET /skills (getAllMySkills) - Deve bloquear acesso à skill privada se o usuário não for o autor", async () => {
        let receivedError: any;
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
            send_ok: () => res,
            err_unauthorized: (message: string) => new Error(message)
        } as unknown as Response;

        const next: NextFunction = (error?: any) => {
            receivedError = error;
        };

        await controller.getAllMySkills(req, res, next);

        assertEquals(receivedError instanceof Error, true);
        assertEquals(receivedError.message, "Você não tem permissão para acessar essa skill");
    });

    await t.step("POST /skills - Deve criar uma Skill", async () => {
        let responseData: any;
        let createdStatus = false;

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
                createdStatus = true;
                return res;
            },
            err_badRequest: (message: string) => new Error(message)
        } as unknown as Response;

        const next: NextFunction = (error?: any) => {
            if (error) throw error;
        };

        await controller.createSkill(req, res, next);

        assertEquals(createdStatus, true);
        assertEquals(responseData.title, "Aprendendo Deno");
        assertEquals(responseData.author, "user123");
    });

    await t.step("POST /skills - Não deve criar Skill sem título", async () => {
        let receivedError: any;

        const req = {
            user: { id: "user123" },
            body: {
                content: "Conteúdo sobre Deno",
                tags: ["deno"]
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
    });

    await t.step("POST /skills - Não deve criar Skill sem conteúdo", async () => {
        let receivedError: any;

        const req = {
            user: { id: "user123" },
            body: {
                title: "Aprendendo Deno",
                tags: ["deno"]
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
    });

    await t.step("POST /skills - Não deve criar Skill sem tags", async () => {
        let receivedError: any;

        const req = {
            user: { id: "user123" },
            body: {
                title: "Aprendendo Deno",
                content: "Conteúdo sobre Deno"
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
    });

    await t.step("PATCH /skills - Deve atualizar uma Skill", async () => {
        let responseMessage: string | undefined;

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
            },
            err_notFound: (message: string) => new Error(message)
        } as unknown as Response;

        const next: NextFunction = (error?: any) => {
            if (error) throw error;
        };

        await controller.updateSkill(req, res, next);

        assertEquals(responseMessage, "Skill Editada com sucesso");
    });

    await t.step("PATCH /skills - Deve rejeitar ID inválido", async () => {
        let receivedError: any;

        const req = {
            user: { id: "user123" },
            body: {
                _id: "id-invalido",
                title: "Deno Avançado"
            }
        } as unknown as Request;

        const res = {
            err_notFound: (message: string) => new Error(message)
        } as unknown as Response;

        const next: NextFunction = (error?: any) => {
            receivedError = error;
        };

        await controller.updateSkill(req, res, next);

        assertEquals(receivedError instanceof Error, true);
    });

    await t.step("PATCH /skills - Deve rejeitar Skill inexistente", async () => {
        let receivedError: any;

        const req = {
            user: { id: "user123" },
            body: {
                _id: "507f1f77bcf86cd799439011",
                title: "Deno Avançado"
            }
        } as unknown as Request;

        const res = {
            send_ok: () => res,
            err_notFound: (message: string) => new Error(message)
        } as unknown as Response;

        const next: NextFunction = (error?: any) => {
            receivedError = error;
        };

        await notFoundController.updateSkill(req, res, next);

        assertEquals(receivedError instanceof Error, true);
    });

    await t.step("DELETE /skills - Deve excluir uma Skill", async () => {
        let responseData: any;

        const req = {
            user: { id: "user123" },
            body: {
                _id: "507f1f77bcf86cd799439011"
            }
        } as unknown as Request;

        const res = {
            send_ok: (_message: string, data: any) => {
                responseData = data;
                return res;
            },
            err_notFound: (message: string) => new Error(message)
        } as unknown as Response;

        const next: NextFunction = (error?: any) => {
            if (error) throw error;
        };

        await controller.deleteSkill(req, res, next);

        assertEquals(responseData.deletedCount, 1);
    });

    await t.step("DELETE /skills - Deve rejeitar ID inválido", async () => {
        let receivedError: any;

        const req = {
            user: { id: "user123" },
            body: {
                _id: "id-invalido"
            }
        } as unknown as Request;

        const res = {
            err_notFound: (message: string) => new Error(message)
        } as unknown as Response;

        const next: NextFunction = (error?: any) => {
            receivedError = error;
        };

        await controller.deleteSkill(req, res, next);

        assertEquals(receivedError instanceof Error, true);
    });

    await t.step("DELETE /skills - Deve rejeitar Skill inexistente", async () => {
        let receivedError: any;

        const req = {
            user: { id: "user123" },
            body: {
                _id: "507f1f77bcf86cd799439011"
            }
        } as unknown as Request;

        const res = {
            send_ok: () => res,
            err_notFound: (message: string) => new Error(message)
        } as unknown as Response;

        const next: NextFunction = (error?: any) => {
            receivedError = error;
        };

        await notFoundController.deleteSkill(req, res, next);

        assertEquals(receivedError instanceof Error, true);
    });
});