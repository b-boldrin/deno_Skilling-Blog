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



            const skillId = req.query.skillId
            
            if (skillId !== undefined && res.locals.targetSkill) {
                
                if (res.locals.targetSkill.isPublic === false) {
                    if (req.user.id === res.locals.targetSkill.author){
                        return res.send_ok("Skill Encontrada:", res.locals.targetSkill)
                    }
                    return next(res.err_unauthorized("Você não tem permissão para acessar essa skill"))
                }
                else {
                    return res.send_ok("Skill Encontrada:", res.locals.targetSkill)
                }
            }

            const page = Number(req.query.page ?? 1);

            if (!Number.isInteger(page) || page < 1) {
                return next(res.err_badRequest("Paginação inválida", {expected: "?page=$number", received:  "?page=" + req.query.page}));
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

    const findSkillById = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const rawSkillId = req.query.skillId;

            if (rawSkillId === undefined) {
                return next("route");
            }

            const skillIdBefore = String(rawSkillId);

            if (!mongoose.Types.ObjectId.isValid(skillIdBefore)) {
                return next(
                    res.err_notFound("Id não é valido", {
                        expected_format: "?skillId=\$_id",
                        received: "?skillId=" + req.query.skillId
                    })
                );
            }

            const skillId = new mongoose.Types.ObjectId(skillIdBefore);
            const findSkill = await skillService.findSkillById(skillId);

            if (!findSkill) {
                return next(
                    res.err_notFound("Id não é valido", { received: skillId })
                );
            }

            if (findSkill.isPublic === false) {
                res.locals.targetSkill = findSkill;
                return next("route");
            }

            return res.send_ok("Skill Encontrada:", findSkill);
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
                return next(res.err_badRequest("Paginação inválida", {expected: "?page=$number", received:  "?page=" + req.query.page}));
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
                    res.err_badRequest("Campos obrigatórios não informados",{expected_format: {title: "Titulo da Minha Skill", content: "Conteúdo que será repassado para o agente", isPublic: false, tags: ["desenvolvimento"]}, received: req.body})                );
            }

            const newSkill = await skillService.createSkill(req.body);

            return res.send_created("Skill criada com sucesso!", newSkill);

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
                return next(res.err_notFound("Id não é valido", {expected_format: { _id: "Id da Skill"}, received: req.body}));
            }

            req.body.authorId = req.user.id!;

            const deletedSkill = await skillService.removeSkill(req.body);

            if (deletedSkill.deletedCount === 0) {
                return next(res.err_notFound("Skill não encontrada", {expected_format: { _id: "Id da Skill"}, received: req.body}));
            }

            return res.send_ok("Skill deletada", deletedSkill);

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
                return next(res.err_notFound("Id não é valido", {expected_format: { _id: "Id da Skill"}, received: req.body}));
            }

            req.body.authorId = req.user.id!;

            const updatedSkill = await skillService.updateSkill(req.body);

            if (updatedSkill.matchedCount === 0) {
                return next(res.err_notFound("Skill não encontrada", {expected_format: { _id: "Id da Skill"}, received: req.body}));
            }

            return res.send_ok("Skill Editada com sucesso", updatedSkill);

        } catch (err) {
            return next(err);
        }
    };

    return {
        getAllMySkills,
        getAllPublicSkills,
        createSkill,
        deleteSkill,
        updateSkill,
        findSkillById
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