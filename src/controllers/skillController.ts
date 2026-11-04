import * as skillService from "../services/skillService.ts";
import type { Request, Response, NextFunction } from "express";

export const getAllSkills = async (_req: Request, res: Response, next: NextFunction) => {
    try {

        const skills = await skillService.getAllSkills();
        
        res.send_ok("Skills Encontradas:", skills);
    } catch (err : any) {
        return next(res.err_internal(err));
    }
};

export const createSkill = async (req: Request, res: Response, next: NextFunction) => {
    try {

        const newSkill = await skillService.createSkill(req.body);

        res.send_created(newSkill);

    } catch (err : any) {
        return next(res.err_internal(err));
    }
};

export const deleteSkill = async (req: Request, res: Response, next: NextFunction) => {
    try {

        const deletedSkill = await skillService.removeSkill(req.body);

        res.send_ok(deletedSkill);

    } catch (err : any) {
        return next(res.err_internal(err));
    }
};


    