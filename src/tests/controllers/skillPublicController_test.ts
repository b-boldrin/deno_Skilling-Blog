import { assertEquals } from "jsr:@std/assert";
import mongoose from "mongoose";
import type { Request, Response, NextFunction } from "npm:express";
import { createSkillController } from "../../controllers/skillController.ts";
import { createSkillService } from "../../services/skillService.ts";

Deno.test("SkillPublicController", async (t) => {
    const service = createSkillService({
        findAllPublic: async (_page?: number) => [
            {
                _id: new mongoose.Types.ObjectId("507f1f77bcf86cd799439011"),
                title: "Aprendendo Deno",
                content: "Conteúdo sobre Deno",
                tags: ["deno", "typescript"],
                author: "user123",
                isPublic: true
            } as any
        ]
    } as any);
    const controller = createSkillController(service);

    await t.step("GET /skills/public - Deve listar Skills públicas", async () => {

        let responseData: any;

        const req = {
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

        await controller.getAllPublicSkills(req, res, next);

        assertEquals(responseData.length, 1);
        assertEquals(responseData[0].title, "Aprendendo Deno");
        assertEquals(responseData[0].isPublic, true);
    });

    await t.step("GET /skills/public?page=abc - Deve rejeitar paginação inválida", async () => {

        let receivedError: any;

        const req = {
            query: { page: "abc" }
        } as unknown as Request;

        const res = {
            err_badRequest: (message: string) => new Error(message)
        } as unknown as Response;

        const next: NextFunction = (error?: any) => {
            receivedError = error;
        };

        await controller.getAllPublicSkills(req, res, next);

        assertEquals(receivedError instanceof Error, true);
        assertEquals(receivedError.message, "Paginação inválida");
    });

    await t.step("GET /skills/public?page=0 - Deve rejeitar página menor que 1", async () => {

        let receivedError: any;

        const req = {
            query: { page: "0" }
        } as unknown as Request;

        const res = {
            err_badRequest: (message: string) => new Error(message)
        } as unknown as Response;

        const next: NextFunction = (error?: any) => {
            receivedError = error;
        };

        await controller.getAllPublicSkills(req, res, next);

        assertEquals(receivedError instanceof Error, true);
    });

});
