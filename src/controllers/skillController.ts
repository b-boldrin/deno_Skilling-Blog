import * as skillService from "../services/skillService.ts";
import type { Request, Response, NextFunction } from "express";

export const getAllMySkills = async (req: Request, res: Response, next: NextFunction) => {
    try {

        const skills = await skillService.getAllMySkills(req.user.id!, req.query.page as unknown as number);
        
        res.send_ok("Skills Encontradas:", skills);
    } catch (err : any) {
        return next(res.err_internal(err));
    }
};



export const getAllPublicSkills = async (req: Request, res: Response, next: NextFunction) => {
    try {

        const skills = await skillService.getAllPublicSkills(req.query.page as unknown as number);
        
        res.send_ok("Skills Encontradas:", skills);
    } catch (err : any) {
        return next(res.err_internal(err));
    }
};

export const createSkill = async (req: Request, res: Response, next: NextFunction) => {
    try {

        req.body.author = req.user.id!;

        if (!req.body.content || !req.body.tags) {
            return next(res.err_badRequest("Campos obrigatórios não informados"));
        }

        const newSkill = await skillService.createSkill(req.body);

        res.send_created(newSkill);

    } catch (err : any) {
        return next(res.err_internal(err));
    }
};

export const deleteSkill = async (req: Request, res: Response, next: NextFunction) => {
    try {

        req.body.author = req.user.id!;

        const deletedSkill = await skillService.removeSkill(req.body);

        if (deletedSkill.deletedCount === 0) {
            next(res.err_notFound("Skill não encontrada"));
        }

        res.send_ok(deletedSkill);

    } catch (err : any) {
        return next((err));
    }
};


export const updateSkill = async (req: Request, res: Response, next: NextFunction) => {
    try {

        req.body.authorId = req.user.id!

        const updatedSkill = await skillService.updateSkill(req.body);

        res.send_ok("Skill Editada com sucesso");

    } catch (err : any) {
        return next(res.err_internal(err));
    }
};