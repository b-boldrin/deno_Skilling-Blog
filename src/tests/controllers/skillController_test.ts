
import {
    assertEquals
} from "jsr:@std/assert";

import type {
    Request,
    Response,
    NextFunction
} from "npm:express";

import {
    createSkillController
} from "../../controllers/skillController.ts";

import {
    createSkillService
} from "../../services/skillService.ts";

import {
    skillRepositoryMock
} from "../mocks/skillRepositoryMock.ts";

const skillRepositoryNotFoundMock = {
    findAllByUserId: async () => [],
    findAllPublic: async () => [],
    create: async (data: any) => data,

    remove: async () => ({
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

const notFoundService = createSkillService(
    skillRepositoryNotFoundMock
);

const notFoundController = createSkillController(notFoundService);

Deno.test("SkillController", async (t) => {

    const service = createSkillService(skillRepositoryMock);
    const controller = createSkillController(service);

    await t.step("GET /skills - Deve listar skills do usuário", async () => {

        let responseData: any;

        const req = {
            user: { id: "user123" },
            query: {}
        } as Request;

        const res = {
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
    } as Request;

    const res = {
        send_created: (_message: string, data : any) => {
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
    } as Request;

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
    } as Request;

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
    } as Request;

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
    } as Request;

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
    } as Request;

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
    } as Request;

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
    } as Request;

    const res = {
        send_ok: (_message : string, data: any) => {
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
    } as Request;

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
    } as Request;

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
