import * as skillService from "../services/skillService.ts";
import type { Request, Response } from "express";

export const getAllSkills = async (_req: Request, res: Response) => {
    try {

        const skills = await skillService.getAllSkills();
        
        res.send_ok("Skills Encontradas:", skills);
    } catch (err) {
        const error = err as Error;
        res.status(500).json({ error: error.message });
    }
};

export const createSkill = async (req: Request, res: Response) => {
    try {

        const newSkill = await skillService.createSkill(req.body);

        res.send_created(newSkill);

    } catch (err) {
        const error = err as Error;
        res.status(500).json({ error: error.message });
    }
};

export const deleteSkill = async (req: Request, res: Response) => {
    try {

        const deletedSkill = await skillService.removeSkill(req.body);

        res.send_ok(deletedSkill);

    } catch (err) {
        const error = err as Error;
        res.status(500).json({ error: error.message });
    }
};


    