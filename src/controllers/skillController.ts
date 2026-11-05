import type { Request, Response, NextFunction } from "express";
import skillServiceDefault from "../services/skillService.ts";
import mongoose from "mongoose"

export const createSkillController = 
    (skillService = skillServiceDefault) => {
        const getAllMySkills = async (
            req: Request,
            res: Response,
            next: NextFunction
        ) => {
            try {
            const page = Number(req.query.page ?? 1);

            if (!Number.isInteger(page) || page < 1) {
                return next(res.err_badRequest("Paginação inválida"));
            }

            const skills = await skillService.getAllMySkills(
                req.user.id!,
                page
            );

            return res.send_ok("Skills Encontradas:", skills);

        } catch (err) {
            return next(err);
        }
    };

    const getAllPublicSkills = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const page = Number(req.query.page ?? 1);

            if (!Number.isInteger(page) || page < 1) {
                return next(res.err_badRequest("Paginação inválida"));
            }

            const skills = await skillService.getAllPublicSkills(page);

            return res.send_ok("Skills Encontradas:", skills);

        } catch (err) {
            return next(err);
        }
    };

    const createSkill = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        try {
            req.body.author = req.user.id!;

            if (
                !req.body.title ||
                !req.body.content ||
                !Array.isArray(req.body.tags) ||
                req.body.tags.length === 0
                ) {
                return next(
                    res.err_badRequest("Campos obrigatórios não informados")
                );
            }

            const newSkill = await skillService.createSkill(req.body);

            return res.send_created(newSkill);

        } catch (err) {
            return next(err);
        }
    };

    const deleteSkill = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        try {
            if (!mongoose.Types.ObjectId.isValid(req.body._id)) {
                return next(res.err_notFound("Skill não encontrada"));
            }

            req.body.authorId = req.user.id!;

            const deletedSkill = await skillService.removeSkill(req.body);

            if (deletedSkill.deletedCount === 0) {
                return next(res.err_notFound("Skill não encontrada"));
            }

            return res.send_ok(deletedSkill);

        } catch (err) {
            return next(err);
        }
    };

    const updateSkill = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        try {
            if (!mongoose.Types.ObjectId.isValid(req.body._id)) {
                return next(res.err_notFound("Skill não encontrada"));
            }

            req.body.authorId = req.user.id!;

            const updatedSkill = await skillService.updateSkill(req.body);

            if (updatedSkill.matchedCount === 0) {
                return next(res.err_notFound("Skill não encontrada"));
            }

            return res.send_ok("Skill Editada com sucesso");

        } catch (err) {
            return next(err);
        }
    };

    return {
        getAllMySkills,
        getAllPublicSkills,
        createSkill,
        deleteSkill,
        updateSkill
    };
};

const skillController = createSkillController();

export default skillController

// export default skillController;



// // CONTROLLER --------------------------------------------- GET ALL MY SKILL

// export const getAllMySkills = async (req: Request, res: Response, next: NextFunction) => {
//     try {

//         const skills = await skillService.getAllMySkills(req.user.id!, req.query.page as unknown as number);
        
//         res.send_ok("Skills Encontradas:", skills);
//     } catch (err : any) {
//         return next(err);
//     }
// };

// // CONTROLLER --------------------------------------------- GET ALL PUBLIC SKILLS

// export const getAllPublicSkills = async (req: Request, res: Response, next: NextFunction) => {
//     try {

//         const skills = await skillService.getAllPublicSkills(req.query.page as unknown as number);
        
//         res.send_ok("Skills Encontradas:", skills);
//     } catch (err : any) {
//         return next(err);
//     }
// };

// // CONTROLLER --------------------------------------------- CREATE SKILL

// export const createSkill = async (req: Request, res: Response, next: NextFunction) => {
//     try {

//         req.body.author = req.user.id!;

//         if (!req.body.content || !req.body.tags) {
//             return next(res.err_badRequest("Campos obrigatórios não informados"));
//         }

//         const newSkill = await skillService.createSkill(req.body);

//         res.send_created(newSkill);

//     } catch (err : any) {
//         return next(err);
//     }
// };


// // CONTROLLER --------------------------------------------- DELETE SKILL

// export const deleteSkill = async (req: Request, res: Response, next: NextFunction) => {
//     try {

//         if (!mongoose.Types.ObjectId.isValid(req.body._id)) {
//             return next(res.err_notFound("Skill não encontrada"));
//         }

//         req.body.authorId = req.user.id!;

//         const deletedSkill = await skillService.removeSkill(req.body);

//         if (deletedSkill.deletedCount === 0) {
//             return next(res.err_notFound("Skill não encontrada"));
//         }

//         return res.send_ok(deletedSkill);

//     } catch (err : any) {
//         return next(err);
//     }
// };

// // CONTROLLER --------------------------------------------- UPDATE SKILL

// export const updateSkill = async (req: Request, res: Response, next: NextFunction) => {
//     try {

//         req.body.authorId = req.user.id!

//         if (!mongoose.Types.ObjectId.isValid(req.body._id)) {
//             return next(res.err_notFound("Skill não encontrada"));
//         }

//         const updatedSkill = await skillService.updateSkill(req.body);

//         if (updatedSkill.matchedCount === 0) {
//             return next(res.err_notFound("Skill não encontrada"));
//         }

//         return res.send_ok("Skill Editada com sucesso");

//     } catch (err : any) {

//         return next("Problema Interno");
//     }
// };